
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
import type { Question } from "@/lib/types"
import { mockQuestions } from "@/lib/mock-data"

const ActionsCell = ({ question }: { question: Question }) => {
    // Add logic for Edit/Delete here
    const handleEdit = () => alert(`Editing "${question.text}"`);
    const handleDelete = () => alert(`Deleting "${question.text}"`);
  
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

const columns: ColumnDef<Question>[] = [
  {
    accessorKey: "order",
    header: "Order",
  },
  {
    accessorKey: "text",
    header: "Question Text",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell question={row.original} />,
  },
]

export function QuestionsTable() {
    const data = React.useMemo(() => mockQuestions || [], []);

    const handleAdd = () => {
        alert("Opening form to add new question...")
    }

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Feedback Questions</CardTitle>
            <CardDescription>Manage the criteria used for student feedback.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                </Button>
            </div>
            <DataTable 
                columns={columns} 
                data={data.sort((a,b) => a.order - b.order)}
                filterColumn="text"
                filterPlaceholder="Filter by question text..."
             />
        </CardContent>
    </Card>
  )
}
