import { FC } from "react";

interface TableCellProps {
    params: {
        row: any;
    };
    column: {
        key: string;
        render?: (params: any) => JSX.Element; 
    };
}

const TableCell: FC<TableCellProps> = ({ params, column }) => {
    if (typeof column.render === "function") {
        return column.render(params);
    } else {
        return <span>{params.row[column.key]}</span>;
    }
};

export default TableCell;