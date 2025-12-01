import React from "react";

function Table({ columns, rows, keyField = "id", onRow }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr 
              key={row[keyField]}
              onClick={onRow ? () => onRow(row) : undefined}
              className={onRow ? "row-click" : undefined}
              style={onRow ? { cursor: "pointer" } : undefined}
            >
              {columns.map((c) => (
                <td key={c.key}>
                  {typeof c.render === "function"
                    ? c.render(row[c.key], row)
                    : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

