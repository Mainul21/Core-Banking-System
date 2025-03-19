import { useNavigate } from "react-router";

const App = () => {
  const navigate = useNavigate(); 
  return (
    <div className="w-11/12 mx-auto mt-10 p-5 min-h-1/3">
      <img src="./CBS.png" className="w-1/4 mx-auto mb-10" alt="" />
      <h1 className="text-5xl bold text-center">Welcome to Core Banking</h1>
      <div className="flex justify-center mt-10 p-5">
        <button
          className="btn bg-emerald-500 hover:bg-blue-500 text-black p-10"
          onClick={() => navigate("/login")} // Corrected
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default App;
