
"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { DataTable } from "./data-table"
import type { Faculty } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface FacultyTableProps {
  data: Faculty[];
  setData: React.Dispatch<React.SetStateAction<Faculty[]>>;
}

const ActionsCell = ({ faculty, setData }: { faculty: Faculty; setData: React.Dispatch<React.SetStateAction<Faculty[]>> }) => {
    const handleEdit = () => {
        const newName = prompt("Enter new name:", faculty.name);
        if (!newName) return;
        const newDept = prompt("Enter new department:", faculty.department);
        if (!newDept) return;
        setData(prev => prev.map(f => f.id === faculty.id ? { ...f, name: newName, department: newDept } : f));
    };
    
    const handleDelete = () => {
        if(confirm(`Are you sure you want to delete ${faculty.name}?`)) {
            setData(prev => prev.filter(f => f.id !== faculty.id));
        }
    };
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
};

const getColumns = (setData: React.Dispatch<React.SetStateAction<Faculty[]>>): ColumnDef<Faculty>[] => [
  {
    accessorKey: "faculty_id",
    header: "Faculty ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell faculty={row.original} setData={setData} />,
  },
];

export function FacultyTable({ data, setData }: FacultyTableProps) {
    const { toast } = useToast();
    const columns = React.useMemo(() => getColumns(setData), [setData]);

    const handleAdd = () => {
        const facultyId = prompt("Enter Faculty ID:");
        if (!facultyId) return;

        if (data.some(f => f.faculty_id === facultyId)) {
            toast({
                variant: 'destructive',
                title: "Duplicate Faculty ID",
                description: "A faculty member with this ID already exists.",
            });
            return;
        }

        const name = prompt("Enter Name:");
        if (!name) return;
        const department = prompt("Enter Department:");
        if (!department) return;
        const password = "password123";

        setData(prev => [...prev, { id: facultyId, faculty_id: facultyId, name, department, password }]);
    }

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Faculty</CardTitle>
            <CardDescription>Add, edit, and remove faculty records.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty
                </Button>
            </div>
            <DataTable 
                columns={columns} 
                data={data}
                filterColumn="name"
                filterPlaceholder="Filter by name..."
             />
        </CardContent>
    </Card>
  )
}
