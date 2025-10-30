
"use client";

import { useState, type ChangeEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "@/components/data-tables/students-table";
import { FacultyTable } from "@/components/data-tables/faculty-table";
import { QuestionsTable } from "@/components/data-tables/questions-table";
import { ClassFacultyMappingTable } from "@/components/data-tables/class-faculty-mapping-table";
import { BrainCircuit, Upload, Users, Briefcase, HelpCircle, FileUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Student, Faculty, ClassFacultyMapping } from "@/lib/types";

type UploadType = 'students' | 'faculty' | 'mappings';

const MOCK_STUDENTS_FROM_FILE: Student[] = [
    { id: '2403310914821001', register_number: '2403310914821001', name: 'ABHIJEETH KUMAR R', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822002', register_number: '2403310914822002', name: 'ABINAYA C', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822003', register_number: '2403310914822003', name: 'ABINAYA R', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821004', register_number: '2403310914821004', name: 'AFSAL AHMED KHAN A', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821005', register_number: '2403310914821005', name: 'AKASH M', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821006', register_number: '2403310914821006', name: 'ANANTHA KRISHNAA M', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821007', register_number: '2403310914821007', name: 'ARISAN A', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822008', register_number: '2403310914822008', name: 'ARSHIYA THASLIM K', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821009', register_number: '2403310914821009', name: 'BHARATH R', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821010', register_number: '2403310914821010', name: 'CHANDREAMOULEESWARAN M', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822011', register_number: '2403310914822011', name: 'GOPIKA S', password: 'password', class_name: 'AIML-2' },
    { id: '2402210014832012', register_number: '2402210014832012', name: 'HARINI R', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821013', register_number: '2403310914821013', name: 'HARISH R', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821014', register_number: '2403310914821014', name: 'HEMANTH KUMAR J', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821015', register_number: '2403310914821015', name: 'IMRAN S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822016', register_number: '2403310914822016', name: 'INDHUJA S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822017', register_number: '2403310914822017', name: 'JANANI K', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821018', register_number: '2403310914821018', name: 'JANARTHANAN M', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821019', register_number: '2403310914821019', name: 'JASWANTHRAM R', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821020', register_number: '2403310914821020', name: 'JAYAPRAKASH S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821021', register_number: '2403310914821021', name: 'JEEVA S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821022', register_number: '2403310914821022', name: 'JEEVANANTHAM K', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821023', register_number: '2403310914821023', name: 'KABILESH S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821024', register_number: '2403310914821024', name: 'KAMALESH J', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822025', register_number: '2403310914822025', name: 'KANIMOZHI M', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821026', register_number: '2403310914821026', name: 'KARTHICK RAJA S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821027', register_number: '2403310914821027', name: 'KARTHIKEYAN G', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822028', register_number: '2403310914822028', name: 'KAVIYA SRI R', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821029', register_number: '2403310914821029', name: 'KAViyarasan V', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821030', register_number: '2403310914821030', name: 'LOKESH G', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821031', register_number: '2403310914821031', name: 'LOKESH V', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821032', register_number: '2403310914821032', name: 'MADHAVAN B', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822033', register_number: '2403310914822033', name: 'MADHUMITHA S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822034', register_number: '2403310914822034', name: 'MONIKA V', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821035', register_number: '2403310914821035', name: 'MUKESH S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821036', register_number: '2403310914821036', name: 'NAVEEN B', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821037', register_number: '2403310914821037', name: 'NAVEEN KUMAR S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822038', register_number: '2403310914822038', name: 'NIVetha S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821039', register_number: '2403310914821039', name: 'PRAVEEN KUMAR S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821040', register_number: '2403310914821040', name: 'RAGAVAN S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821041', register_number: '2403310914821041', name: 'RAHUL E', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821042', register_number: '2403310914821042', name: 'RAHUL S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821043', register_number: '2403310914821043', name: 'RANJITH S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822044', register_number: '2403310914822044', name: 'RESHMA S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821045', register_number: '2403310914821045', name: 'ROHITH V', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821046', register_number: '2403310914821046', name: 'SANJAY S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821047', register_number: '2403310914821047', name: 'SANTHOSH S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821048', register_number: '2403310914821048', name: 'SARAN S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821049', register_number: '2403310914821049', name: 'SATHISHKUMAR S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821050', register_number: '2403310914821050', name: 'SHAKTHIVEL M', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822051', register_number: '2403310914822051', name: 'SHALINI S', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914821052', register_number: '2403310914821052', name: 'SIVABALAN K', password: 'password', class_name: 'AIML-2' },
    { id: '2403310914822053', register_number: '2403310914822053', name: 'SNEHA G', password: 'password', class_name: 'AIML-2' },
];

export default function DataManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [mappings, setMappings] = useState<ClassFacultyMapping[]>([]);
  
  const [selectedFiles, setSelectedFiles] = useState<Record<UploadType, File | null>>({
    students: null,
    faculty: null,
    mappings: null,
  });
  const [uploading, setUploading] = useState<UploadType | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: UploadType) => {
    const file = e.target.files?.[0] || null;
    setSelectedFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleUpload = async (type: UploadType) => {
    const file = selectedFiles[type];
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: `Please select a file to upload for ${type}.`,
      });
      return;
    }

    setUploading(type);
    
    // Simulate API call and data processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate adding data from the uploaded file
    if (type === 'students') {
      setStudents(prev => [...prev, ...MOCK_STUDENTS_FROM_FILE]);
    } else if (type === 'faculty') {
      const facId = `${Date.now()}`.slice(-4);
      const newFaculty: Faculty = { id: facId, faculty_id: facId, name: 'New Faculty', department: 'Mechanical', password: 'password123' };
      setFaculty(prev => [...prev, newFaculty]);
    } else if (type === 'mappings') {
      const newMapping: ClassFacultyMapping = { id: `map-${Date.now()}`, class_name: 'CS-B', faculty_id: '102', subject: 'New Subject' };
      setMappings(prev => [...prev, newMapping]);
    }

    // Reset file input and state
    setSelectedFiles(prev => ({ ...prev, [type]: null }));
    const fileInput = document.getElementById(`${type}-file`) as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
    
    setUploading(null);

    toast({
      title: "Upload Successful",
      description: `${file.name} has been processed and data has been added.`,
    });
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
          <StudentTable data={students} setData={setStudents} />
        </TabsContent>
        <TabsContent value="faculty" className="mt-4">
          <FacultyTable data={faculty} setData={setFaculty} />
        </TabsContent>
        <TabsContent value="questions" className="mt-4">
          <QuestionsTable />
        </TabsContent>
        <TabsContent value="mappings" className="mt-4">
            <ClassFacultyMappingTable data={mappings} setData={setMappings} allFaculty={faculty} />
        </TabsContent>
        <TabsContent value="bulk-upload" className="mt-4">
            <Card className="shadow-2xl">
                <CardHeader>
                    <CardTitle>Bulk Data Upload</CardTitle>
                    <CardDescription>Upload CSV or Excel files to add multiple records at once. This is a simulation and will add sample data.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8 md:grid-cols-3">
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Students</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>register_number,name,password,class_name</code></pre>
                        <div className="mt-auto space-y-3">
                           <Input id="students-file" type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileChange(e, 'students')}/>
                           <Button className="w-full" onClick={() => handleUpload('students')} disabled={uploading === 'students' || !selectedFiles.students}>
                            {uploading === 'students' ? <Loader2 className="mr-2 animate-spin"/> : <FileUp className="mr-2"/>}
                            Upload Students
                           </Button>
                        </div>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Faculty</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>faculty_id,name,password,department</code></pre>
                        <div className="mt-auto space-y-3">
                           <Input id="faculty-file" type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileChange(e, 'faculty')} />
                           <Button className="w-full" onClick={() => handleUpload('faculty')} disabled={uploading === 'faculty' || !selectedFiles.faculty}>
                            {uploading === 'faculty' ? <Loader2 className="mr-2 animate-spin"/> : <FileUp className="mr-2"/>}
                            Upload Faculty
                           </Button>
                        </div>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Class-Faculty Mappings</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>class_name,faculty_id,subject</code></pre>
                        <div className="mt-auto space-y-3">
                           <Input id="mappings-file" type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileChange(e, 'mappings')} />
                           <Button className="w-full" onClick={() => handleUpload('mappings')} disabled={uploading === 'mappings' || !selectedFiles.mappings}>
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

    