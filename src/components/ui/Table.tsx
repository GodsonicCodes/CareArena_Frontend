import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

function TableFooter({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn('bg-gray-100 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption className={cn('mt-4 text-sm text-gray-500', className)} {...props} />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
