import "./table.css";
import { FC } from "react";
import TableCell from "./tableCell";

interface TableProps {
  data: any[];
  columns: any[];
  tableClass?: string;
  tableStyle?: object;
}

const Table: FC<TableProps> = ({
  data = [],
  columns = [],
  tableClass = "is-fullwidth is-striped",
  tableStyle = {},
}) => {
  return (
    <div className="table-wrapper">
      <table className={tableClass} style={tableStyle}>
        <thead>
          <tr>
            {columns.map((column, indexColumn) => (
              <th key={indexColumn.toString()} style={{ width: column.width }}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, indexRow) => (
            <tr key={indexRow.toString()}>
              {columns.map((column, indexColumn) => (
                <td key={indexColumn.toString()}>
                  <TableCell column={column} params={{ row }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {!data ||
          (data.length === 0 && (
            <img
              className="no-record"
              src="../../assets/images/no-record.png"
              alt="No Record"
            />
          ))}
      </div>
    </div>
  );
};

export default Table;