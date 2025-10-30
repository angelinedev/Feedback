"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/star-rating";
import { useToast } from "@/hooks/use-toast";
import type { Question } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface FeedbackFormProps {
  questions: Question[];
  facultyId: string;
  subject: string;
  onSubmit: (facultyId: string, subject: string) => void;
}

export function FeedbackForm({ questions, facultyId, subject, onSubmit }: FeedbackFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const schema = z.object({
    ratings: z.record(z.number().min(1, "Please provide a rating for every question.")),
    comment: z.string().optional(),
  });
  
  const defaultValues = {
    ratings: questions.reduce((acc, q) => ({ ...acc, [q.id]: 0 }), {}),
    comment: "",
  };

  const { control, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange"
  });

  const onFormSubmit = (data: z.infer<typeof schema>) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Feedback submitted:", { ...data, facultyId, subject });
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable input.",
      });
      onSubmit(facultyId, subject);
      setLoading(false);
    }, 1000);
  };
  
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 p-1 pr-6">
        <div className="space-y-6">
          {questions.sort((a, b) => a.order - b.order).map((question) => (
            <div key={question.id} className="p-4 bg-muted/30 rounded-lg shadow-inner">
              <Label className="font-semibold text-base">{question.text}</Label>
              <Controller
                name={`ratings.${question.id}`}
                control={control}
                render={({ field }) => (
                  <StarRating
                    rating={field.value}
                    onRatingChange={field.onChange}
                  />
                )}
              />
              {errors.ratings?.[question.id] && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ratings[question.id]?.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment" className="font-semibold text-base">Anonymous Comment (Optional)</Label>
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <Textarea
                id="comment"
                placeholder="Share any additional thoughts or suggestions..."
                {...field}
                className="min-h-[120px]"
              />
            )}
          />
        </div>

        <Button type="submit" className="w-full shadow-lg hover:shadow-primary/40" disabled={loading || !isValid}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Feedback'}
        </Button>
        </form>
    </ScrollArea>
  );
}
