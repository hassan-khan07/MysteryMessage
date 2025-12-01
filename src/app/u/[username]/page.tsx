// "use client";
// import React from "react";
// import { useCompletion } from "@ai-sdk/react";
// import { Button } from "@/components/ui/button";

// const specialChar = "||";

// const parseStringMessages = (messages: string) => {
//   if (!messages) return [];
//   return messages.split(specialChar).map((m) => m.trim());
// };

// export default function SendMessage() {
//   const {
//     complete,
//     completion,
//     isLoading,
//     error,
//   } = useCompletion({
//     api: "/api/suggest-messages",
//   });

//   const fetchSuggestedMessages = async () => {
//     console.log("🚀 Calling complete()...");
//     await complete(""); // Empty string to use default prompt
//   };

//   console.log("🔥 completion updated:", completion);
//   console.log("⚠️ error:", error);
//   console.log("⏳ isLoading:", isLoading);

//   const messages = parseStringMessages(completion);

//   return (
//     <div className="p-6 max-w-xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Suggested Messages</h2>

//       <Button onClick={fetchSuggestedMessages} disabled={isLoading}>
//         {isLoading ? "Generating..." : "Suggest Messages"}
//       </Button>

//       <div className="mt-6 space-y-3">
//         {error && (
//           <p className="text-red-500">❌ Error: {error.message}</p>
//         )}

//         {!completion && !isLoading && (
//           <p className="text-gray-500">Click the button to generate messages.</p>
//         )}

//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className="p-3 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
//           >
//             {msg}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { useCompletion } from "@ai-sdk/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
// import { toast } from '@/components/ui/use-toast';
import { toast } from "sonner";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialMessageString,
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message); // Todo
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data, // why send data like that and not just data because data is an object with content property and we need to send content property only
        username, // why send username here because we need to know which user to send the message to
      });

      // toast({
      //   title: response.data.message,
      //   variant: 'default',
      // });
      toast.success(response.data.message);
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      // toast({
      //   title: 'Error',
      //   description:
      //     axiosError.response?.data.message ?? 'Failed to sent message',
      //   variant: 'destructive',
      // });
      toast.error(
        axiosError.response?.data.message ?? "Failed to sent message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      // why we wrap it in try and catch method because complete method can throw an error and we want to handle it gracefully 
      complete("");
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Handle error appropriately
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={"/sign-up"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
