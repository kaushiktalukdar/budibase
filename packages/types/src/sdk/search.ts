import { Operation } from "./datasources"
import { Row, Table, DocumentType } from "../documents"
import { SortOrder, SortType } from "../api"
import { Knex } from "knex"

export enum SearchFilterOperator {
  STRING = "string",
  FUZZY = "fuzzy",
  RANGE = "range",
  EQUAL = "equal",
  NOT_EQUAL = "notEqual",
  EMPTY = "empty",
  NOT_EMPTY = "notEmpty",
  ONE_OF = "oneOf",
  CONTAINS = "contains",
  NOT_CONTAINS = "notContains",
  CONTAINS_ANY = "containsAny",
}

export enum InternalSearchFilterOperator {
  COMPLEX_ID_OPERATOR = "_complexIdOperator",
}

type BasicFilter = Record<string, string> & {
  [InternalSearchFilterOperator.COMPLEX_ID_OPERATOR]?: never
}

type ArrayFilter = Record<string, string[]> & {
  [InternalSearchFilterOperator.COMPLEX_ID_OPERATOR]?: {
    id: string[]
    values: string[]
  }
}

type RangeFilter = Record<
  string,
  | {
      high: number | string
      low: number | string
    }
  | { high: number | string }
  | { low: number | string }
> & {
  [InternalSearchFilterOperator.COMPLEX_ID_OPERATOR]?: never
}

export type AnySearchFilter = BasicFilter | ArrayFilter | RangeFilter

export interface SearchFilters {
  allOr?: boolean
  // TODO: this is just around for now - we need a better way to do or/and
  // allows just fuzzy to be or - all the fuzzy/like parameters
  fuzzyOr?: boolean
  onEmptyFilter?: EmptyFilterOption
  [SearchFilterOperator.STRING]?: BasicFilter
  [SearchFilterOperator.FUZZY]?: BasicFilter
  [SearchFilterOperator.RANGE]?: RangeFilter
  [SearchFilterOperator.EQUAL]?: BasicFilter
  [SearchFilterOperator.NOT_EQUAL]?: BasicFilter
  [SearchFilterOperator.EMPTY]?: BasicFilter
  [SearchFilterOperator.NOT_EMPTY]?: BasicFilter
  [SearchFilterOperator.ONE_OF]?: ArrayFilter
  [SearchFilterOperator.CONTAINS]?: ArrayFilter
  [SearchFilterOperator.NOT_CONTAINS]?: ArrayFilter
  [SearchFilterOperator.CONTAINS_ANY]?: ArrayFilter
  // specific to SQS/SQLite search on internal tables this can be used
  // to make sure the documents returned are always filtered down to a
  // specific document type (such as just rows)
  documentType?: DocumentType
}

export type SearchFilterKey = keyof Omit<
  SearchFilters,
  "allOr" | "onEmptyFilter" | "fuzzyOr" | "documentType"
>

export type SearchQueryFields = Omit<SearchFilters, "allOr" | "onEmptyFilter">

export interface SortJson {
  [key: string]: {
    direction: SortOrder
    type?: SortType
  }
}

export interface PaginationJson {
  limit: number
  page?: string | number
  offset?: number
}

export interface RenameColumn {
  old: string
  updated: string
}

export interface RelationshipsJson {
  through?: string
  from?: string
  to?: string
  fromPrimary?: string
  toPrimary?: string
  tableName: string
  column: string
}

export interface QueryJson {
  endpoint: {
    datasourceId: string
    entityId: string
    operation: Operation
    schema?: string
  }
  resource?: {
    fields: string[]
  }
  filters?: SearchFilters
  sort?: SortJson
  paginate?: PaginationJson
  body?: Row | Row[]
  table?: Table
  meta: {
    table: Table
    tables?: Record<string, Table>
    renamed?: RenameColumn
    // can specify something that columns could be prefixed with
    columnPrefix?: string
  }
  extra?: {
    idFilter?: SearchFilters
  }
  relationships?: RelationshipsJson[]
  tableAliases?: Record<string, string>
}

export interface QueryOptions {
  disableReturning?: boolean
  disableBindings?: boolean
}

export type SqlQueryBinding = Knex.Value[]

export interface SqlQuery {
  sql: string
  bindings?: SqlQueryBinding
}

export enum EmptyFilterOption {
  RETURN_ALL = "all",
  RETURN_NONE = "none",
}

export enum SqlClient {
  MS_SQL = "mssql",
  POSTGRES = "pg",
  MY_SQL = "mysql2",
  ORACLE = "oracledb",
  SQL_LITE = "sqlite3",
}
