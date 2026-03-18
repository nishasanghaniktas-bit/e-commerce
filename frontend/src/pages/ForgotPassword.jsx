import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { API_BASE } from "../utils/apiBase";

function ForgotPassword() {

const [email,setEmail] = useState("");

const handleSubmit = async (e)=>{
e.preventDefault();

try{

const res = await fetch(`${API_BASE}/api/auth/forgot-password`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({email})
});

const data = await res.json();

alert(data.message);

}catch(err){
alert("Server Error");
}

};

return(

<AuthLayout title="Forgot Password" subtitle="Enter your email">

<form onSubmit={handleSubmit} className="space-y-5">

<input
type="email"
placeholder="Email"
required
className="w-full p-3 rounded-xl bg-white/30 border border-white/40 text-white placeholder-white/70 focus:ring-2 focus:ring-white outline-none"
onChange={(e)=>setEmail(e.target.value)}
/>

<button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:scale-105 transition">
Send Reset Link
</button>

<p className="text-center text-white/80 text-sm">
<Link to="/">Back to Login</Link>
</p>

</form>

</AuthLayout>

);
}

export default ForgotPassword;
