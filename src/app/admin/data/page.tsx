
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "@/components/data-tables/student-table";
import { FacultyTable } from "@/components/data-tables/faculty-table";
import { QuestionsTable } from "@/components/data-tables/questions-table";
import { ClassFacultyMappingTable } from "@/components/data-tables/class-faculty-mapping-table";
import { BrainCircuit, Upload, Users, Briefcase, HelpCircle, FileUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Student, Faculty, ClassFacultyMapping } from "@/lib/types";
import { useData } from "@/components/data-provider";

type UploadType = 'students' | 'faculty' | 'mappings';

export default function DataManagementPage() {
    const { students, setStudents, faculty, setFaculty, mappings, setMappings } = useData();
  
  const [pastedData, setPastedData] = useState<Record<UploadType, string>>({
    students: "",
    faculty: "",
    mappings: "",
  });
  const [uploading, setUploading] = useState<UploadType | null>(null);
  const { toast } = useToast();

  const handleTextChange = (text: string, type: UploadType) => {
    setPastedData(prev => ({ ...prev, [type]: text }));
  };

  const handleUpload = async (type: UploadType) => {
    const data = pastedData[type];
    if (!data.trim()) {
      toast({
        variant: "destructive",
        title: "No data to upload",
        description: `Please paste data into the text area for ${type}.`,
      });
      return;
    }

    setUploading(type);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const lines = data.trim().split('\n').slice(1);
        let addedCount = 0;
        let skippedCount = 0;

        if (type === 'students') {
            const newStudents: Student[] = [];
            const existingIds = new Set(students.map(s => s.register_number));
            lines.forEach(line => {
                const [register_number, name, password, class_name] = line.split(',');
                if (register_number && name && password && class_name && !existingIds.has(register_number)) {
                    newStudents.push({ id: register_number, register_number, name, password, class_name });
                    existingIds.add(register_number);
                } else {
                    skippedCount++;
                }
            });
            setStudents(prev => [...prev, ...newStudents]);
            addedCount = newStudents.length;
        } else if (type === 'faculty') {
            const newFaculty: Faculty[] = [];
            const existingIds = new Set(faculty.map(f => f.faculty_id));
            lines.forEach(line => {
                const [faculty_id, name, password, department] = line.split(',');
                if (faculty_id && name && password && department && !existingIds.has(faculty_id)) {
                    newFaculty.push({ id: faculty_id, faculty_id, name, password, department });
                    existingIds.add(faculty_id);
                } else {
                    skippedCount++;
                }
            });
            setFaculty(prev => [...prev, ...newFaculty]);
            addedCount = newFaculty.length;
        } else if (type === 'mappings') {
            const newMappings: ClassFacultyMapping[] = [];
            const existingMappings = new Set(mappings.map(m => `${m.class_name}-${m.faculty_id}-${m.subject}`));
            lines.forEach(line => {
                const [class_name, faculty_id, subject] = line.split(',');
                const mappingKey = `${class_name}-${faculty_id}-${subject}`;
                if (class_name && faculty_id && subject && !existingMappings.has(mappingKey)) {
                    newMappings.push({ id: `map-${Date.now()}-${Math.random()}`, class_name, faculty_id, subject });
                    existingMappings.add(mappingKey);
                } else {
                    skippedCount++;
                }
            });
            setMappings(prev => [...prev, ...newMappings]);
            addedCount = newMappings.length;
        }

        setPastedData(prev => ({ ...prev, [type]: "" })); // Clear textarea
        setUploading(null);

        toast({
          title: "Upload Successful",
          description: `${addedCount} records added. ${skippedCount} duplicate records were skipped.`,
        });

    } catch (error) {
        setUploading(null);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: `There was an error parsing the data. Please ensure it's in the correct CSV format.`,
        });
        console.error("Upload error:", error);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Data Management</h1>
      </div>
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="students"><Users className="mr-2" />Students</TabsTrigger>
          <TabsTrigger value="faculty"><Briefcase className="mr-2" />Faculty</TabsTrigger>
          <TabsTrigger value="questions"><HelpCircle className="mr-2" />Questions</TabsTrigger>
          <TabsTrigger value="mappings"><BrainCircuit className="mr-2" />Mappings</TabsTrigger>
          <TabsTrigger value="bulk-upload"><Upload className="mr-2" />Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <StudentTable />
        </TabsContent>
        <TabsContent value="faculty" className="mt-4">
          <FacultyTable />
        </TabsContent>
        <TabsContent value="questions" className="mt-4">
          <QuestionsTable />
        </TabsContent>
        <TabsContent value="mappings" className="mt-4">
            <ClassFacultyMappingTable />
        </TabsContent>
        <TabsContent value="bulk-upload" className="mt-4">
            <Card className="shadow-2xl">
                <CardHeader>
                    <CardTitle>Bulk Data Upload</CardTitle>
                    <CardDescription>Copy data from your spreadsheet and paste it into the appropriate text area below. Ensure the first row is a header.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8 md:grid-cols-3">
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Students</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>register_number,name,password,class_name</code></pre>
                        <div className="mt-auto space-y-3 flex flex-col flex-grow">
                           <Textarea 
                             placeholder="Paste student data here..." 
                             className="flex-grow" 
                             value={pastedData.students} 
                             onChange={(e) => handleTextChange(e.target.value, 'students')}
                           />
                           <Button className="w-full" onClick={() => handleUpload('students')} disabled={uploading === 'students' || !pastedData.students}>
                            {uploading === 'students' ? <Loader2 className="mr-2 animate-spin"/> : <FileUp className="mr-2"/>}
                            Upload Students
                           </Button>
                        </div>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Faculty</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>faculty_id,name,password,department</code></pre>
                        <div className="mt-auto space-y-3 flex flex-col flex-grow">
                           <Textarea 
                             placeholder="Paste faculty data here..." 
                             className="flex-grow"
                             value={pastedData.faculty} 
                             onChange={(e) => handleTextChange(e.target.value, 'faculty')}
                           />
                           <Button className="w-full" onClick={() => handleUpload('faculty')} disabled={uploading === 'faculty' || !pastedData.faculty}>
                            {uploading === 'faculty' ? <Loader2 className="mr-2 animate-spin"/> : <FileUp className="mr-2"/>}
                            Upload Faculty
                           </Button>
                        </div>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Class-Faculty Mappings</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>class_name,faculty_id,subject</code></pre>
                        <div className="mt-auto space-y-3 flex flex-col flex-grow">
                           <Textarea 
                             placeholder="Paste mapping data here..." 
                             className="flex-grow"
                             value={pastedData.mappings} 
                             onChange={(e) => handleTextChange(e.target.value, 'mappings')}
                           />
                           <Button className="w-full" onClick={() => handleUpload('mappings')} disabled={uploading === 'mappings' || !pastedData.mappings}>
                            {uploading === 'mappings' ? <Loader2 className="mr-2 animate-spin"/> : <FileUp className="mr-2"/>}
                            Upload Mappings
                           </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
