import { useMemo } from "react";
import { useTable } from "react-table";

export default function ScheduleTable({ data }) {
  const columns = useMemo(
    () =>
      data[0]
        ? Object.keys(data[0]).map((key) => ({
            Header: key,
            accessor: key,
          }))
        : [],
    [data]
  );

  const tableInstance = useTable({ columns, data });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <table {...getTableProps()} style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} key={column.id} style={{ border: "1px solid #444", padding: "0.5rem" }}>
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.id}>
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()} key={cell.column.id} style={{ border: "1px solid #444", padding: "0.5rem" }}>
                  {cell.render("Cell")}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
