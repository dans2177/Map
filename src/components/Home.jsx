import { FaApple, FaGooglePlay, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import personalizedCareImage from "/car_1/1.webp";
import familySuccessImage from "/car_1/2.webp";
import thrivingEnvironmentImage from "/car_1/3.webp";
import logo from "/logo.png";

function Home() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/map");
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/banner.webp')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Top Floating Bar */}
        <header className="absolute top-0 left-0 w-full flex justify-between items-center p-4 z-20">
          <div className="flex items-center space-x-4 bg-white bg-opacity-80 rounded-full px-3 py-2">
            <span className="text-sm font-semibold">Get The App</span>
            <FaApple className="text-gray-800" size={20} />
            <FaGooglePlay className="text-gray-800" size={20} />
          </div>
          <div className="flex space-x-4 items-center bg-white bg-opacity-80 rounded-full px-3 py-2">
            <span className="text-sm font-semibold">This Weeks Webinar:</span>
            <span className="text-sm font-semibold">
              Practicing Good Posture
            </span>
          </div>
          <div className="flex space-x-4 items-center">
            <div className="bg-white bg-opacity-80 rounded-full px-3 py-2">
              <span className="text-sm font-semibold">Resources</span>
            </div>
            <div className="bg-white bg-opacity-80 rounded-full px-3 py-2">
              <span className="text-sm font-semibold">About</span>
            </div>
            {/* <div className="bg-white bg-opacity-80 rounded-full px-3 py-2">
              <span className="text-sm font-semibold">Services</span>
            </div> */}
          </div>
        </header>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
            <span>
              Precise <span className="text-blue-500">Care</span>
            </span>
            <br />
            <span>
              Precisely <span className="text-blue-500">for you</span>
            </span>
          </h1>
          <button
            onClick={handleButtonClick}
            className="bg-white bg-opacity-30 backdrop-blur-md text-white py-2 px-6 rounded-full flex items-center space-x-2 hover:bg-opacity-40 transition mt-4"
          >
            <span className="text-lg">Find a Provider</span>
            <FaArrowRight />
          </button>
        </div>

        {/* Logo at the bottom center */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
           {/* <img src={logo} alt="Logo" className="h-4 md:h-4" />  */}
          {/* <h1 className="text-white "> App Name</h1> */}
        </div>
      </section>

      {/* Central Banner Section */}
      <section className="bg-blue-500 text-white py-6">
        <div className="container mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold">
            Your health is our priority. Find trusted chiropractors at your
            convenience.
          </h2>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Doctors Who Believe in{" "}
            <span className="text-blue-500">Healthcare</span> Over Sick Care
          </h2>
          <p className="text-gray-600 text-lg md:text-xl mb-8">
            Putting your needs first and ensuring your family has the right
            environment to thrive.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Personalized Care */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src={personalizedCareImage}
                alt="Personalized Care"
                className="mb-4 w-full h-64 object-cover rounded-md"
              />
              <h3 className="text-xl font-semibold mb-2">Personalized Care</h3>
              <p className="text-gray-600">
                Our doctors prioritize your individual health needs, providing
                care tailored specifically to you.
              </p>
            </div>

            {/* Card 2: Family Success */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src={familySuccessImage}
                alt="Family Success"
                className="mb-4 w-full h-64 object-cover rounded-md"
              />
              <h3 className="text-xl font-semibold mb-2">Family Success</h3>
              <p className="text-gray-600">
                Focused on the well-being of your entire family, our care
                extends beyond just treatment, aiming for long-term success.
              </p>
            </div>

            {/* Card 3: Thriving Environments */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src={thrivingEnvironmentImage}
                alt="Thriving Environments"
                className="mb-4 w-full h-64 object-cover rounded-md"
              />
              <h3 className="text-xl font-semibold mb-2">
                Thriving Environments
              </h3>
              <p className="text-gray-600">
                We help create the right environment for your family to thrive,
                both physically and emotionally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources and More Info Buttons */}
      <section className="py-10 bg-gray-200 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Resources for Better Health
          </h2>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-500 text-white py-2 px-4 rounded-full text-lg hover:bg-blue-600">
              Find Resources
            </button>
            <button className="bg-blue-500 text-white py-2 px-4 rounded-full text-lg hover:bg-blue-600">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Holistic Health Bottom Section */}
      <section className="bg-gray-200 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Holistic Health for a Better You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Health Food */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                Healthy Food Choices
              </h3>
              <p className="text-gray-600">
                Discover nutritious recipes and food options that support your
                overall wellness.
              </p>
            </div>
            {/* Stretches */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Daily Stretches</h3>
              <p className="text-gray-600">
                Learn effective stretching routines to keep your body flexible
                and healthy.
              </p>
            </div>
            {/* Items to Help You */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                Ergonomic Tools & Standing Desks
              </h3>
              <p className="text-gray-600">
                Explore tools like standing desks and ergonomic chairs that
                support your posture and health.
              </p>
            </div>
            {/* Blog */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                Health & Wellness Blog
              </h3>
              <p className="text-gray-600">
                Stay informed with the latest tips and insights on living a
                healthy lifestyle.
              </p>
            </div>
            {/* Webinars */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                Webinars & Workshops
              </h3>
              <p className="text-gray-600">
                Join our live webinars and workshops to learn more about
                holistic health practices.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
