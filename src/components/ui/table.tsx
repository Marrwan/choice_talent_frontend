import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse border border-gray-200">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={`bg-white ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => {
  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 ${className}`}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<TableHeadProps> = ({ children, className = '' }) => {
  return (
    <th className={`px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200 ${className}`}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => {
  return (
    <td className={`px-4 py-3 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}; 