import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";

//  Explicit Route Context type (THIS fix was for Vercel error)
type RouteContext = {
  params: {
    messageid: string;
  };
};

export async function DELETE(
  request: Request,
  context: RouteContext // no inline destructuring
) {
  const { messageid } = context.params; // safe extraction

  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  //  ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(messageid)) {
    return Response.json(
      { success: false, message: "Invalid message ID" },
      { status: 400 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { success: false, message: "Message not found or already deleted" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
