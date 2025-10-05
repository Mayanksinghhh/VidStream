import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    console.log('Login attempt for email:', email);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('User found:', { id: user._id, username: user.username, email: user.email });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      console.log('Invalid password for user:', user.email);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const tokenPayload = { 
      _id: user._id, 
      username: user.username, 
      email: user.email,
      profileImage: user.profileImage 
    };
    
    console.log('Creating JWT with payload:', tokenPayload);
    
    const JWT_SECRET = process.env.JWT_SECRET || 'secret_jwt_dummy';
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });
    
    console.log('JWT token created, length:', token.length);

    return NextResponse.json({ token, user }, { status: 200 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
