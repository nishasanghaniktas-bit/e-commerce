import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { API_BASE } from "../utils/apiBase";

function ResetPassword(){

const {token} = useParams();
const navigate = useNavigate();

const [password,setPassword] = useState("");

const handleSubmit = async(e)=>{
e.preventDefault();

try{

const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({password})
});

const data = await res.json();

alert(data.message);

navigate("/");

}catch(err){
alert("Server Error");
}

};

return(

<AuthLayout title="Reset Password" subtitle="Enter new password">

<form onSubmit={handleSubmit} className="space-y-5">

<input
type="password"
placeholder="New Password"
required
className="w-full p-3 rounded-xl bg-white/30 border border-white/40 text-white placeholder-white/70 focus:ring-2 focus:ring-white outline-none"
onChange={(e)=>setPassword(e.target.value)}
/>

<button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:scale-105 transition">
Update Password
</button>

</form>

</AuthLayout>

);
}

export default ResetPassword;
