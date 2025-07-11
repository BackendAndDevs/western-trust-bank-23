
import { Calendar, MapPin, Users, Trophy } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2426&q=80"
              alt="Modern banking office"
              className="rounded-lg shadow-lg"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                150+ Years of Banking Excellence
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Since 1873, Western Trust Bank has been a cornerstone of American banking, 
                providing reliable financial services through economic booms and challenges alike. 
                Our commitment to our customers and communities has never wavered.
              </p>
              <p className="text-lg text-gray-600">
                Today, we combine our rich heritage with cutting-edge technology to deliver 
                modern banking solutions while maintaining the personal touch and trust 
                that has defined us for generations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">1873</div>
                  <div className="text-sm text-gray-600">Founded</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Locations</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">2M+</div>
                  <div className="text-sm text-gray-600">Customers</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">Top 10</div>
                  <div className="text-sm text-gray-600">US Bank</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To empower individuals, families, and businesses to achieve their financial goals 
                through innovative banking solutions, exceptional service, and unwavering integrity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
