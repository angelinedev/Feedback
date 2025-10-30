"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, Sparkles, Loader2 } from "lucide-react"
import { generateClassFacultyMapping, type GenerateClassFacultyMappingOutput } from "@/ai/flows/generate-class-faculty-mapping"

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
import type { ClassFacultyMapping } from "@/lib/types"
import { mockClassFacultyMapping, mockFaculty } from "@/lib/mock-data"
import { Textarea } from "../ui/textarea"
import { useToast } from "@/hooks/use-toast"


const ActionsCell = ({ mapping }: { mapping: ClassFacultyMapping }) => {
    // Add logic for Edit/Delete here
    const handleEdit = () => alert(`Editing mapping ${mapping.id}`);
    const handleDelete = () => alert(`Deleting mapping ${mapping.id}`);
  
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

const columns: ColumnDef<ClassFacultyMapping>[] = [
  {
    accessorKey: "class_name",
    header: "Class Name",
  },
  {
    accessorKey: "faculty_id",
    header: "Faculty",
    cell: ({ row }) => {
        const faculty = mockFaculty.find(f => f.faculty_id === row.original.faculty_id);
        return faculty ? `${faculty.name} (${faculty.faculty_id})` : row.original.faculty_id;
    }
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell mapping={row.original} />,
  },
]

export function ClassFacultyMappingTable() {
    const [data, setData] = React.useState<ClassFacultyMapping[]>(mockClassFacultyMapping);
    const [prompt, setPrompt] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const { toast } = useToast();

    const handleAdd = () => {
        alert("Opening form to add new mapping...")
    }

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({ variant: 'destructive', title: "Prompt is empty", description: "Please enter a prompt to generate mappings." });
            return;
        }
        setLoading(true);
        try {
            // This is a mock implementation. In a real scenario, this would call the AI flow.
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockOutput: GenerateClassFacultyMappingOutput = {
                mappings: [
                    { class_name: 'CS-C', faculty_id: '102', subject: 'Advanced Algorithms' },
                    { class_name: 'EC-B', faculty_id: '201', subject: 'VLSI Design' }
                ]
            };
            const newMappings = mockOutput.mappings.map((m, i) => ({...m, id: `gen-${Date.now()}-${i}`}));
            setData(prev => [...prev, ...newMappings]);
            toast({ title: "Mappings Generated", description: `${newMappings.length} new mappings have been added to the table.` });

        } catch (error) {
            console.error("Failed to generate mappings:", error);
            toast({ variant: 'destructive', title: "Generation Failed", description: "An error occurred while generating mappings." });
        } finally {
            setLoading(false);
        }
    }

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Class-Faculty Mappings</CardTitle>
            <CardDescription>Assign faculty and subjects to classes.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                    <h3 className="font-semibold">Generate with AI</h3>
                    <Textarea 
                        placeholder="e.g., 'Assign Dr. Reed (101) to CS-A for Data Structures and Prof. Green (102) to CS-A for Algorithms'" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Mappings
                    </Button>
                </div>
                <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg shadow-inner">
                    <div className="text-center">
                        <h3 className="font-semibold">Manual Entry</h3>
                        <p className="text-sm text-muted-foreground mb-4">Or, add a single mapping manually.</p>
                        <Button onClick={handleAdd}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Mapping
                        </Button>
                    </div>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={data}
                filterColumn="class_name"
                filterPlaceholder="Filter by class name..."
             />
        </CardContent>
    </Card>
  )
}
