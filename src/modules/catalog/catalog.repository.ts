import { prisma } from "@/lib/prisma";

import {
  CatalogStatus,
  type Prisma,
  type ProduceCategory,
  type Unit,
} from "../../../generated/prisma";

/**
 * The structural slice of a Prisma model delegate that the catalog CRUD
 * surface actually touches.
 *
 * Declaring it this way — rather than naming `Prisma.UnitDelegate` — is what
 * lets one factory serve both tables: the two generated delegates share no
 * common supertype, but both satisfy this shape. It also pins down exactly
 * what the factory is allowed to do, so it cannot quietly grow a `deleteMany`
 * against a reference table that other rows have foreign keys into.
 */
type CatalogDelegate<TRecord, TCreateInput, TUpdateInput> = {
  findMany(args: {
    where: { status?: CatalogStatus };
    orderBy: { name: "asc" };
  }): Promise<TRecord[]>;

  findUnique(args: { where: { id: string } }): Promise<TRecord | null>;

  create(args: { data: TCreateInput }): Promise<TRecord>;

  updateMany(args: {
    where: { id: string };
    data: TUpdateInput;
  }): Promise<{ count: number }>;
};

export type CatalogRepository<TRecord, TCreateInput, TUpdateInput> = {
  list(includeInactive: boolean): Promise<TRecord[]>;
  create(data: TCreateInput): Promise<TRecord>;
  /** Resolves to `null` when no row matched the id. */
  update(id: string, data: TUpdateInput): Promise<TRecord | null>;
};

/**
 * Builds the read/write surface for one reference table.
 *
 * `ProduceCategory` and `Unit` differ only in their columns, never in how a
 * row is listed, inserted or amended, so the behaviour is written once and
 * bound to each delegate below.
 */
export function createCatalogRepository<TRecord, TCreateInput, TUpdateInput>(
  delegate: CatalogDelegate<TRecord, TCreateInput, TUpdateInput>,
): CatalogRepository<TRecord, TCreateInput, TUpdateInput> {
  return {
    list: (includeInactive: boolean) =>
      delegate.findMany({
        // An empty `where` is the widening case, so the status predicate is
        // dropped rather than set to `{ in: [...] }` — the default path stays
        // a plain equality the index can serve.
        where: includeInactive ? {} : { status: CatalogStatus.ACTIVE },
        // Reference data is read to populate pickers, so alphabetical beats
        // insertion order. Unpaginated by design: these tables hold tens of
        // rows, not thousands.
        orderBy: { name: "asc" },
      }),

    create: (data: TCreateInput) => delegate.create({ data }),

    /**
     * `updateMany` + re-read rather than `update`, matching
     * `payoutAccountRepository.updatePayoutAccount`. A bare `update` on an
     * unknown id throws Prisma's P2025, which would have to be caught and
     * translated; `updateMany` reports a count of zero instead, and the
     * service turns that into a 404. Two round trips, but the absent-row case
     * stays an ordinary value rather than an exception.
     */
    update: async (id: string, data: TUpdateInput) => {
      const result = await delegate.updateMany({ where: { id }, data });

      if (result.count === 0) {
        return null;
      }

      return delegate.findUnique({ where: { id } });
    },
  };
}

export const produceCategoryRepository = createCatalogRepository<
  ProduceCategory,
  Prisma.ProduceCategoryCreateInput,
  Prisma.ProduceCategoryUpdateInput
>(prisma.produceCategory);

export const unitRepository = createCatalogRepository<
  Unit,
  Prisma.UnitCreateInput,
  Prisma.UnitUpdateInput
>(prisma.unit);
