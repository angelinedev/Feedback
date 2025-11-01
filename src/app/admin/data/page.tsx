
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "@/components/data-tables/student-table";
import { FacultyTable } from "@/components/data-tables/faculty-table";
import { QuestionsTable } from "@/components/data-tables/questions-table";
import { ClassFacultyMappingTable } from "@/components/data-tables/class-faculty-mapping-table";
import { BrainCircuit, Upload, Users, Briefcase, HelpCircle } from "lucide-react";
import { BulkUpload } from "@/components/bulk-upload";

export default function DataManagementPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Data Management</h1>
      </div>
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students"><Users className="mr-2" />Students</TabsTrigger>
          <TabsTrigger value="faculty"><Briefcase className="mr-2" />Faculty</TabsTrigger>
          <TabsTrigger value="questions"><HelpCircle className="mr-2" />Questions</TabsTrigger>
          <TabsTrigger value="mappings"><BrainCircuit className="mr-2" />Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <BulkUpload type="students" />
          <StudentTable />
        </TabsContent>
        <TabsContent value="faculty" className="mt-4">
          <BulkUpload type="faculty" />
          <FacultyTable />
        </TabsContent>
        <TabsContent value="questions" className="mt-4">
          <QuestionsTable />
        </TabsContent>
        <TabsContent value="mappings" className="mt-4">
          <BulkUpload type="mappings" />
          <ClassFacultyMappingTable />
        </TabsContent>
      </Tabs>
    </>
  );
}
