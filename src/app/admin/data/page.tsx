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
import { useFirebase } from "@/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

type UploadType = 'students' | 'faculty' | 'mappings';

export default function DataManagementPage() {
    const { students, faculty, mappings } = useData();
    const { firestore, auth } = useFirebase();
  
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
    
    try {
        const lines = data.trim().split('\n').slice(1);
        let addedCount = 0;
        let skippedCount = 0;

        if (type === 'students') {
            const existingIds = new Set(students.map(s => s.register_number));
            for (const line of lines) {
                const [register_number, name, password, class_name] = line.split(',');
                if (register_number && name && password && class_name && !existingIds.has(register_number)) {
                    const email = `${register_number}@feedloop-student.com`;
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const studentData: Omit<Student, 'id'> = { register_number, name, class_name };
                        await setDoc(doc(firestore, "students", userCredential.user.uid), studentData);
                        existingIds.add(register_number);
                        addedCount++;
                    } catch (error: any) {
                        if (error.code === 'auth/email-already-in-use') {
                            skippedCount++;
                        } else {
                            throw error; // Rethrow other errors
                        }
                    }
                } else {
                    skippedCount++;
                }
            }
        } else if (type === 'faculty') {
            const existingIds = new Set(faculty.map(f => f.faculty_id));
            for (const line of lines) {
                const [faculty_id, name, password, department] = line.split(',');
                if (faculty_id && name && password && department && !existingIds.has(faculty_id)) {
                     const email = `${faculty_id}@feedloop-faculty.com`;
                     try {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const facultyData: Omit<Faculty, 'id'> = { faculty_id, name, department };
                        await setDoc(doc(firestore, "faculty", userCredential.user.uid), facultyData);
                        existingIds.add(faculty_id);
                        addedCount++;
                    } catch (error: any) {
                        if (error.code === 'auth/email-already-in-use') {
                            skippedCount++;
                        } else {
                            throw error;
                        }
                    }
                } else {
                    skippedCount++;
                }
            }
        } else if (type === 'mappings') {
            const existingMappings = new Set(mappings.map(m => `${m.class_name}-${m.faculty_id}-${m.subject}`));
            for (const line of lines) {
                const [class_name, faculty_id, subject] = line.split(',');
                const mappingKey = `${class_name}-${faculty_id}-${subject}`;
                if (class_name && faculty_id && subject && !existingMappings.has(mappingKey)) {
                    const newDocRef = doc(collection(firestore, 'classFacultyMapping'));
                    await setDoc(newDocRef, { class_name, faculty_id, subject, id: newDocRef.id });
                    existingMappings.add(mappingKey);
                    addedCount++;
                } else {
                    skippedCount++;
                }
            }
        }

        setPastedData(prev => ({ ...prev, [type]: "" })); // Clear textarea
        toast({
          title: "Upload Successful",
          description: `${addedCount} records added. ${skippedCount} duplicate or invalid records were skipped.`,
        });

    } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: `There was an error processing the data. Please check the console for details.`,
        });
        console.error("Upload error:", error);
    } finally {
        setUploading(null);
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
