import { useNavigate } from "react-router";

const App = () => {
  const navigate = useNavigate(); 
  return (
    <div className="min-h-screen bg-[url('./bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="w-11/12 mx-auto pt-10 p-5 min-h-1/3 ">
        <img src="./CBS.png" className="w-1/4 mx-auto mb-10" alt="" />
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">
          Welcome to Core Banking
        </h1>
        <div className="flex justify-center mt-10 p-5">
          <button
            className="btn bg-emerald-500 font-bold hover:bg-blue-500 text-black p-10"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
