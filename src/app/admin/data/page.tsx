import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "@/components/data-tables/students-table";
import { FacultyTable } from "@/components/data-tables/faculty-table";
import { QuestionsTable } from "@/components/data-tables/questions-table";
import { ClassFacultyMappingTable } from "@/components/data-tables/class-faculty-mapping-table";
import { BrainCircuit, Upload, Users, Briefcase, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
                    <CardTitle>Bulk Upload Guide</CardTitle>
                    <CardDescription>Follow the CSV/Excel header formats below for bulk data uploads.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                    <div className="p-4 bg-muted/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold mb-2">Students</h3>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto"><code>register_number,name,password,class_name</code></pre>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold mb-2">Faculty</h3>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto"><code>faculty_id,name,password,department</code></pre>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold mb-2">Class-Faculty Mappings</h3>
                        <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto"><code>class_name,faculty_id,subject</code></pre>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
