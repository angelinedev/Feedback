import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "@/components/data-tables/students-table";
import { FacultyTable } from "@/components/data-tables/faculty-table";
import { QuestionsTable } from "@/components/data-tables/questions-table";
import { ClassFacultyMappingTable } from "@/components/data-tables/class-faculty-mapping-table";
import { BrainCircuit, Upload, Users, Briefcase, HelpCircle, FileUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DataManagementPage() {
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
                    <CardDescription>Upload CSV files to add multiple records at once. Please ensure the file headers match the specified format.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8 md:grid-cols-3">
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Students</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>register_number,name,password,class_name</code></pre>
                        <div className="mt-auto space-y-3">
                           <Input id="students-file" type="file" accept=".csv" />
                           <Button className="w-full"><FileUp className="mr-2"/>Upload Students</Button>
                        </div>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Faculty</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>faculty_id,name,password,department</code></pre>
                        <div className="mt-auto space-y-3">
                           <Input id="faculty-file" type="file" accept=".csv" />
                           <Button className="w-full"><FileUp className="mr-2"/>Upload Faculty</Button>
                        </div>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="font-semibold text-lg mb-3">Class-Faculty Mappings</h3>
                        <p className="text-sm text-muted-foreground mb-4">Header format:</p>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto mb-6"><code>class_name,faculty_id,subject</code></pre>
                        <div className="mt-auto space-y-3">
                           <Input id="mappings-file" type="file" accept=".csv" />
                           <Button className="w-full"><FileUp className="mr-2"/>Upload Mappings</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
