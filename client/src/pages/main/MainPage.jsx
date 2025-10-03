import React from 'react';

const App = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="py-4 px-6 flex justify-between items-center sticky top-0 bg-white z-50 shadow-sm">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-2xl font-bold text-purple-800">CogitoSphere</span>
        </div>
        <nav className="hidden lg:flex items-center space-x-6">
          <a href="#" className="hover:text-purple-600 transition-colors">About</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Courses</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Career</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Contact</a>
        </nav>
        <div className="hidden lg:flex items-center space-x-4">
          <a href="/login" className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors">Log In</a>
          <a href="/register" className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">Register</a>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-purple-100 py-16 px-6 lg:px-24">
          <div className="container mx-auto grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Become A Professional <br className="hidden lg:block"/> In Your Sector
              </h1>
              <div className="flex items-center space-x-2 my-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg">Programming Development</span>
              </div>
              <p className="text-gray-600 mb-6">
                Video clip by a professional on <br className="hidden lg:block"/>
                how to become a professional
              </p>
              <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors">
                Explore More
              </button>
            </div>
            <div className="relative">
              <img src="https://placehold.co/400x300/e9d5ff/8b5cf6?text=Image" alt="Professional at desk" className="w-full rounded-2xl shadow-lg" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-4">
                <div className="bg-white p-4 rounded-xl shadow-lg w-28 text-center">
                  <div className="text-3xl font-bold text-purple-600">4.6</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-lg w-28 text-center">
                  <div className="text-3xl font-bold text-purple-600">150+</div>
                  <div className="text-sm text-gray-500">Students</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-lg w-28 text-center">
                  <div className="text-3xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-gray-500">Courses</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Universities Collaboration */}
        <section className="py-16 px-6 lg:px-24">
          <h2 className="text-center text-xl text-gray-600 font-semibold mb-8">
            Over 150 Universities And <br className="lg:hidden"/> Companies Collaborate With Us
          </h2>
          <div className="flex flex-wrap justify-center space-x-4 lg:space-x-8">
            <div className="bg-gray-200 w-20 h-16 rounded-lg my-2 lg:my-0"></div>
            <div className="bg-gray-200 w-20 h-16 rounded-lg my-2 lg:my-0"></div>
            <div className="bg-gray-200 w-20 h-16 rounded-lg my-2 lg:my-0"></div>
            <div className="bg-gray-200 w-20 h-16 rounded-lg my-2 lg:my-0"></div>
            <div className="bg-gray-200 w-20 h-16 rounded-lg my-2 lg:my-0"></div>
          </div>
        </section>

        {/* Online Education Section */}
        <section className="bg-gray-50 py-16 px-6 lg:px-24">
          <div className="container mx-auto grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                Our Online Education <br className="lg:hidden"/> Is Smart & Effective
              </h2>
              <p className="text-gray-600 mb-6">
                Online education can be convenient and flexible and also has the potential to become more personal.
                In this it has also been a great learning experience
              </p>
              <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors">
                Learn more
              </button>
            </div>
            <div>
              <img src="https://placehold.co/400x300/d1c4e9/673ab7?text=Image" alt="Online education" className="w-full rounded-2xl shadow-lg" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 lg:px-24">
          <div className="container mx-auto grid lg:grid-cols-3 gap-8">
            <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center h-48">
              <span className="text-4xl font-bold">Feature</span>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center h-48">
              <span className="text-4xl font-bold">Feature</span>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center h-48">
              <span className="text-4xl font-bold">Feature</span>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center h-48">
              <span className="text-4xl font-bold">Feature</span>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center h-48">
              <span className="text-4xl font-bold">Feature</span>
            </div>
          </div>
        </section>

        {/* Experienced Course Mentor Section */}
        <section className="bg-gray-50 py-16 px-6 lg:px-24">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-extrabold">Experienced Course Mentor</h2>
              <button className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors">
                Explore More
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-orange-200 h-64 rounded-2xl"></div>
              <div className="bg-orange-200 h-64 rounded-2xl"></div>
              <div className="bg-orange-200 h-64 rounded-2xl"></div>
              <div className="bg-orange-200 h-64 rounded-2xl"></div>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="py-16 px-6 lg:px-24">
          <div className="container mx-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-8">What Our Students Say</h2>
            <div className="flex items-start space-x-4">
              <div className="text-8xl text-gray-300 font-bold -mt-8">“</div>
              <div>
                <p className="text-gray-700 text-lg mb-4">
                  The instructor was knowledgeable and engaging, and I learned a lot in this course.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold">Aman</div>
                    <div className="text-sm text-gray-500">Student</div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-6 lg:px-24">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">CogitoSphere</h3>
            <p className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="flex space-x-4 mt-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Address</h4>
            <p className="text-sm">
              123 Main Street, <br />
              New York, NY 10001
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <p className="text-sm">
              Email: info@CogitoSphere.com <br />
              Phone: +1 234 567 8900
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Office</h4>
            <p className="text-sm">
              Mon-Fri: 9am-5pm <br />
              Sat-Sun: Closed
            </p>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8">
          &copy; 2024 CogitoSphere. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
