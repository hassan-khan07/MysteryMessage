import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
// import mongoose from "mongoose"; // Import mongoose

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  // const { messageid } = params;
  const messageid = params.messageid; // TODO : diff between params and destructuring

  await dbConnect();
  const session = await getServerSession(authOptions); // todo
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  // Validate messageid format
  // if (!mongoose.Types.ObjectId.isValid(messageid)) {
  //   return Response.json(
  //     { success: false, message: "Invalid message ID format" },
  //     { status: 400 }
  //   );
  // }

  try {
    const updateResult = await UserModel.updateOne(
     
      { _id: _user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Message deleted successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting message:", error);
    return Response.json(
      { message: "Error deleting message", success: false },
      { status: 500 }
    );
  }
}
