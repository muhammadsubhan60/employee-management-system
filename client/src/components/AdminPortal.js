import React, { useState, useEffect } from 'react';
import { employeeAPI, analyticsAPI, attendanceAPI, shiftAPI } from '../services/api';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  BarChart3, 
  Clock, 
  TrendingUp,
  UserPlus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Briefcase,
  Power,
  DollarSign,
  Code,
  Globe,
  Zap,
  Shield,
  CheckCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import moment from 'moment';
import ShiftsTab from './ShiftsTab';
import USPSLabelsTabAdmin from './USPSLabelsTabAdmin';
import SessionManagementTab from './SessionManagementTab';
import AdminTasksBoard from './AdminTasksBoard';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftEnded, setShiftEnded] = useState(false);
  const [shiftEndTime, setShiftEndTime] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cnic: '',
    dob: '',
    address: '',
    bankAccount: '',
    role: ''
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesRes, summaryRes, totalHoursRes, topPunctualRes, topHardworkingRes, shiftStatusRes] = await Promise.all([
        employeeAPI.getAll(),
        analyticsAPI.getSummary(),
        analyticsAPI.getTotalHours(),
        analyticsAPI.getTopPunctual(),
        analyticsAPI.getTopHardworking(),
        attendanceAPI.getShiftStatus()
      ]);

      setEmployees(employeesRes.data);
      setAnalytics({
        summary: summaryRes.data,
        totalHours: totalHoursRes.data,
        topPunctual: topPunctualRes.data,
        topHardworking: topHardworkingRes.data
      });
      setShiftEnded(shiftStatusRes.data.shiftEnded);
      setShiftEndTime(shiftStatusRes.data.shiftEndTime);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeToGo = async () => {
    if (!window.confirm('Ready to wrap up the day for everyone? Thanks for all the hard work! 💪')) {
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceAPI.timeToGo();
      if (response.data.success) {
        setShiftEnded(true);
        setShiftEndTime(response.data.shiftEndTime);
        alert('Great work today, everyone! Shift wrapped up successfully! 🌟');
      } else {
        alert('Oops! Something went wrong: ' + response.data.error);
      }
    } catch (error) {
      alert('Something went wrong: ' + error.response?.data?.error || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartShift = async () => {
    const message = shiftEnded 
      ? 'Ready to start fresh? Let\'s get everyone back to work! 🌅'
      : 'Ready to kick off another amazing day with the team? 🌟';
    
    if (!window.confirm(message)) {
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceAPI.startShift();
      if (response.data.success) {
        setShiftEnded(false);
        setShiftEndTime(null);
        alert(`Let's do this! ${response.data.action} successfully! 🚀`);
        // Reload data to get updated status
        loadData();
      } else {
        alert('Oops! Something went wrong: ' + response.data.error);
      }
    } catch (error) {
      alert('Something went wrong: ' + error.response?.data?.error || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openModal = (type, employee = null) => {
    setModalType(type);
    setSelectedEmployee(employee);
    if (type === 'edit' && employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        cnic: employee.cnic,
        dob: moment(employee.dob).format('YYYY-MM-DD'),
        address: employee.address,
        bankAccount: employee.bankAccount,
        role: employee.role
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        cnic: '',
        dob: '',
        address: '',
        bankAccount: '',
        role: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cnic: '',
      dob: '',
      address: '',
      bankAccount: '',
      role: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modalType === 'add') {
        await employeeAPI.create(formData);
      } else {
        await employeeAPI.update(selectedEmployee._id, formData);
      }
      closeModal();
      loadData();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setLoading(true);
      try {
        await employeeAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting employee:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to Your Team Hub! 👋
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Here's how our amazing folks are doing today
          </p>
          
          {/* Shift Status */}
          <div className="inline-flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${shiftEnded ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="font-medium text-gray-700">
                {shiftEnded ? '🌙 Team wrapped up for the day' : '☀️ Team is active and working'}
              </span>
            </div>
            {shiftEndTime && (
              <span className="text-sm text-gray-500">
                Finished at: {moment(shiftEndTime).format('HH:mm')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="h-6 w-6 mr-3 text-blue-600" />
            Team Management
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => openModal('add')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add New Team Member
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <Users className="h-5 w-5 mr-2" />
              View All Team Members
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-purple-600" />
            Shift Management
          </h3>
          <div className="space-y-3">
            {shiftEnded ? (
              <button
                onClick={handleStartShift}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {loading ? 'Starting...' : '🌅 Start Fresh Day'}
              </button>
            ) : (
              <button
                onClick={handleTimeToGo}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-400 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {loading ? 'Wrapping up...' : '🌙 Wrap Up Day'}
              </button>
            )}
            <button
              onClick={() => setActiveTab('shifts')}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Manage Shifts
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary?.totalEmployees || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <Clock className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary?.todayAttendance || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Week Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary?.weekHours?.toFixed(1) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary?.lateToday || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Hours Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Hours per Employee</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.totalHours?.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalHours" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Punctual Employees</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.topPunctual || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, punctualityRate }) => `${name}: ${punctualityRate}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="punctualityRate"
              >
                {analytics.topPunctual?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 3 Most Punctual</h3>
          <div className="space-y-3">
            {analytics.topPunctual?.map((employee, index) => (
              <div key={employee.employeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    {employee.profilePicture ? (
                      <img 
                        src={`/api/employees/profile-picture/${employee.employeeId}`}
                        alt={employee.name}
                        className="w-8 h-8 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span 
                      className={`text-sm font-bold text-primary-600 ${
                        employee.profilePicture ? 'hidden' : 'flex'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success-600">{employee.punctualityRate}%</p>
                  <p className="text-sm text-gray-500">{employee.totalHours}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 3 Hardworking</h3>
          <div className="space-y-3">
            {analytics.topHardworking?.map((employee, index) => (
              <div key={employee.employeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center overflow-hidden">
                    {employee.profilePicture ? (
                      <img 
                        src={`/api/employees/profile-picture/${employee.employeeId}`}
                        alt={employee.name}
                        className="w-8 h-8 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span 
                      className={`text-sm font-bold text-warning-600 ${
                        employee.profilePicture ? 'hidden' : 'flex'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-warning-600">{employee.totalHours}h</p>
                  <p className="text-sm text-gray-500">{employee.averageHoursPerDay}h/day</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const EmployeesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Amazing Team! 👥
          </h2>
          <p className="text-lg text-gray-600 mt-2">Manage and support our wonderful folks</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Find someone by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden shadow-md">
                        {employee.profilePicture ? (
                          <img 
                            src={`/api/employees/profile-picture/${employee._id}`}
                            alt={employee.name}
                            className="w-12 h-12 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className={`text-lg font-bold text-white ${
                            employee.profilePicture ? 'hidden' : 'flex'
                          }`}
                        >
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-semibold text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">ID: {employee.cnic}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{employee.email}</div>
                    <div className="text-sm text-gray-500">{employee.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openModal('edit', employee)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                        title="Edit team member"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="Remove team member"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              {searchTerm ? 'No team members found matching your search' : 'No team members yet'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {searchTerm ? 'Try a different search term' : 'Add your first team member to get started!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Logo */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              {/* Company Logo */}
              <img src="/logo.png" alt="Company Logo" className="h-16 w-16 rounded-xl shadow-lg object-cover border-4 border-white bg-white" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Team Management Hub
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Digital Marketing • Software Development • GHL Solutions
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Check-In Page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  window.location.href = '/admin-login';
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <Power className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Team Members
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'shifts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Shifts
            </button>
            <button
              onClick={() => setActiveTab('usps')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'usps'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              USPS Labels
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="h-4 w-4 mr-2" />
              Session Management
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Tasks
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'employees' && <EmployeesTab />}
            {activeTab === 'shifts' && <ShiftsTab />}
            {activeTab === 'usps' && <USPSLabelsTabAdmin />}
            {activeTab === 'sessions' && <SessionManagementTab />}
            {activeTab === 'tasks' && <AdminTasksBoard />}
          </>
        )}
      </div>

      {/* Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {modalType === 'add' ? 'Add New Employee' : 'Edit Employee'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1 relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="mt-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">CNIC</label>
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="mt-1 relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1 relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      rows="3"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                  <div className="mt-1 relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Saving...' : (modalType === 'add' ? 'Add Employee' : 'Update Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal; 