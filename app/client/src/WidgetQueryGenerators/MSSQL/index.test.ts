import { DatasourceConnectionMode } from "entities/Datasource";
import MSSQL from ".";

describe("MSSQL WidgetQueryGenerator", () => {
  const initialValues = {
    actionConfiguration: {
      pluginSpecifiedTemplates: [{ value: true }],
    },
  };
  test("should build select form data correctly", () => {
    const expr = MSSQL.build(
      {
        select: {
          limit: "data_table.pageSize",
          where: 'data_table.searchText || ""',
          offset: "(data_table.pageNo - 1) * data_table.pageSize",
          orderBy: "data_table.sortOrder.column",
          sortOrder: "data_table.sortOrder.order || 'ASC'",
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: [],
        primaryColumn: "genres",
        connectionMode: DatasourceConnectionMode.READ_WRITE,
      },
      initialValues,
    );

    const res = `SELECT
  *
FROM
  someTable
WHERE
  title LIKE '%{{data_table.searchText || \"\"}}%'
ORDER BY
  {{data_table.sortOrder.column || 'genres'}} {{data_table.sortOrder.order || 'ASC' ? \"\" : \"DESC\"}}
OFFSET
  {{(data_table.pageNo - 1) * data_table.pageSize}} ROWS
FETCH NEXT
  {{data_table.pageSize}} ROWS ONLY`;

    expect(expr).toEqual([
      {
        name: "Select_someTable",
        type: "select",
        dynamicBindingPathList: [
          {
            key: "body",
          },
        ],
        payload: {
          pluginSpecifiedTemplates: [{ value: false }],
          body: res,
        },
      },
    ]);
  });

  test("should build select form data correctly without read write permissions", () => {
    const expr = MSSQL.build(
      {
        select: {
          limit: "data_table.pageSize",
          where: 'data_table.searchText || ""',
          offset: "(data_table.pageNo - 1) * data_table.pageSize",
          orderBy: "data_table.sortOrder.column",
          sortOrder: "data_table.sortOrder.order || 'ASC'",
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: [],
        primaryColumn: "genres",
        connectionMode: DatasourceConnectionMode.READ_ONLY,
      },
      initialValues,
    );

    const res = `SELECT
  *
FROM
  someTable
WHERE
  title LIKE '%{{data_table.searchText || \"\"}}%'
ORDER BY
  {{data_table.sortOrder.column || 'genres'}} {{data_table.sortOrder.order || 'ASC' ? \"\" : \"DESC\"}}
OFFSET
  {{(data_table.pageNo - 1) * data_table.pageSize}} ROWS
FETCH NEXT
  {{data_table.pageSize}} ROWS ONLY`;

    expect(expr).toEqual([
      {
        name: "Select_someTable",
        type: "select",
        dynamicBindingPathList: [
          {
            key: "body",
          },
        ],
        payload: {
          pluginSpecifiedTemplates: [{ value: false }],
          body: res,
        },
      },
    ]);
  });

  test("should build select form data correctly without primary column", () => {
    const expr = MSSQL.build(
      {
        select: {
          limit: "data_table.pageSize",
          where: 'data_table.searchText || ""',
          offset: "(data_table.pageNo - 1) * data_table.pageSize",
          orderBy: "data_table.sortOrder.column",
          sortOrder: `data_table.sortOrder.order !== "desc"`,
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: [],
        primaryColumn: "",
        connectionMode: DatasourceConnectionMode.READ_WRITE,
      },
      initialValues,
    );

    const res = `SELECT
  *
FROM
  someTable
WHERE
  title LIKE '%{{data_table.searchText || \"\"}}%' {{data_table.sortOrder.column ? \"ORDER BY \" + data_table.sortOrder.column + \"  \" + (data_table.sortOrder.order !== \"desc\" ? \"\" : \"DESC\") : \"\"}}
OFFSET
  {{(data_table.pageNo - 1) * data_table.pageSize}} ROWS
FETCH NEXT
  {{data_table.pageSize}} ROWS ONLY`;

    expect(expr).toEqual([
      {
        name: "Select_someTable",
        type: "select",
        dynamicBindingPathList: [
          {
            key: "body",
          },
        ],
        payload: {
          pluginSpecifiedTemplates: [{ value: false }],
          body: res,
        },
      },
    ]);
  });

  test("should not build update form data without primary key ", () => {
    const expr = MSSQL.build(
      {
        update: {
          value: `update_form.fieldState'`,
          where: `"id" = {{data_table.selectedRow.id}}`,
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: ["id", "name"],
        primaryColumn: "",
        connectionMode: DatasourceConnectionMode.READ_WRITE,
      },
      initialValues,
    );

    expect(expr).toEqual([]);
  });

  test("should not build update form data without read write permissions", () => {
    const expr = MSSQL.build(
      {
        update: {
          value: `update_form.fieldState'`,
          where: `"id" = {{data_table.selectedRow.id}}`,
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: ["id", "name"],
        primaryColumn: "id",
        connectionMode: DatasourceConnectionMode.READ_ONLY,
      },
      initialValues,
    );

    expect(expr).toEqual([]);
  });

  test("should build update form data correctly ", () => {
    const expr = MSSQL.build(
      {
        update: {
          value: `update_form.fieldState'`,
          where: `data_table.selectedRow`,
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: ["id", "name"],
        primaryColumn: "id",
        connectionMode: DatasourceConnectionMode.READ_WRITE,
      },
      initialValues,
    );

    expect(expr).toEqual([
      {
        name: "Update_someTable",
        type: "update",
        dynamicBindingPathList: [
          {
            key: "body",
          },
        ],
        payload: {
          body: "UPDATE someTable SET name= '{{update_form.fieldState'.name}}' WHERE id= '{{data_table.selectedRow.id}}';",
          pluginSpecifiedTemplates: [{ value: false }],
        },
      },
    ]);
  });

  test("should not build insert form data without primary key ", () => {
    const expr = MSSQL.build(
      {
        create: {
          value: `update_form.fieldState`,
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        // ignore columns
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: ["id", "name"],
        primaryColumn: "",
        connectionMode: DatasourceConnectionMode.READ_WRITE,
      },
      initialValues,
    );
    expect(expr).toEqual([]);
  });

  test("should not build insert form data without read write permissions", () => {
    const expr = MSSQL.build(
      {
        create: {
          value: `update_form.fieldState`,
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        // ignore columns
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: ["id", "name"],
        primaryColumn: "id",
        connectionMode: DatasourceConnectionMode.READ_ONLY,
      },
      initialValues,
    );
    expect(expr).toEqual([]);
  });

  test("should build insert form data correctly ", () => {
    const expr = MSSQL.build(
      {
        create: {
          value: `update_form.fieldState`,
        },
        totalRecord: false,
      },
      {
        tableName: "someTable",
        datasourceId: "someId",
        // ignore columns
        aliases: [{ name: "someColumn1", alias: "someColumn1" }],
        widgetId: "someWidgetId",
        searchableColumn: "title",
        columns: ["id", "name"],
        primaryColumn: "id",
        connectionMode: DatasourceConnectionMode.READ_WRITE,
      },
      initialValues,
    );
    expect(expr).toEqual([
      {
        name: "Insert_someTable",
        type: "create",
        dynamicBindingPathList: [
          {
            key: "body",
          },
        ],
        payload: {
          body: "INSERT INTO someTable (name) VALUES ('{{update_form.fieldState.name}}')",
          pluginSpecifiedTemplates: [{ value: false }],
        },
      },
    ]);
  });
});
