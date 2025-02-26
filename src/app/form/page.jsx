"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import useAuthStore from '@/store/user'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  User, 
  Briefcase, 
  Home, 
  Calendar, 
  AtSign, 
  Phone, 
  CreditCard,
  Building,
  MapPin,
  FileText
} from "lucide-react"

export default function UserDetailsForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const userId = useAuthStore((state) => state.userId)
  const token = useAuthStore((state) => state.token)
  const setTransactionId = useAuthStore((state) => state.setTransactionId)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    pan: '',
    contactNumber: '',
    email: '',
    officialEmail: '',
    employmentType: '',
    endUse: '',
    income: '',
    companyName: '',
    udyamNumber: '',
    addressL1: '',
    addressL2: '',
    city: '',
    state: '',
    pincode: '',
    aa_id: '',
    bureauConsent: false,
    lastUpdated: new Date()
  })

  const validateForm = (data, currentStep) => {
    let newErrors = {}
    
    if (currentStep === 1) {
      if (!data.firstName.trim()) newErrors.firstName = "First name is required"
      if (!data.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!data.dob) newErrors.dob = "Date of birth is required"
      if (!data.gender) newErrors.gender = "Gender is required"
      if (!data.pan) newErrors.pan = "PAN number is required"
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan)) 
        newErrors.pan = "Invalid PAN format"
      if (!data.email) newErrors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(data.email)) 
        newErrors.email = "Invalid email format"
      if (!data.officialEmail) newErrors.officialEmail = "Official email is required"
      else if (!/\S+@\S+\.\S+/.test(data.officialEmail)) 
        newErrors.officialEmail = "Invalid email format"
      if (!data.contactNumber) newErrors.contactNumber = "Contact number is required"
      else if (!/^[6-9]\d{9}$/.test(data.contactNumber)) 
        newErrors.contactNumber = "Invalid contact number format"
    } 
    else if (currentStep === 2) {
      if (!data.employmentType) newErrors.employmentType = "Employment type is required"
      if (!data.endUse) newErrors.endUse = "End use is required"
      if (!data.income) newErrors.income = "Income is required"
      else if (isNaN(data.income) || Number(data.income) <= 0) 
        newErrors.income = "Please enter a valid income"
      if (!data.companyName.trim()) newErrors.companyName = "Company name is required"
    } 
    else if (currentStep === 3) {
      if (!data.addressL1.trim()) newErrors.addressL1 = "Address line 1 is required"
      if (!data.city.trim()) newErrors.city = "City is required"
      if (!data.state.trim()) newErrors.state = "State is required"
      if (!data.pincode) newErrors.pincode = "Pincode is required"
      else if (!/^\d{6}$/.test(data.pincode)) 
        newErrors.pincode = "Pincode must be 6 digits"
      if (!data.aa_id.trim()) newErrors.aa_id = "AA ID is required"
      if (!data.bureauConsent) newErrors.bureauConsent = "Bureau consent is required"
    }
    
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
  }

  useEffect(() => {
    const newErrors = validateForm(formData, step)
    setErrors(newErrors)
  }, [formData, step])

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }

  const isStepValid = (stepNumber) => {
    const stepErrors = validateForm(formData, stepNumber)
    return Object.keys(stepErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const formErrors = validateForm(formData, 3)
    setErrors(formErrors)
    
    if (Object.keys(formErrors).length > 0) {
      const allTouched = Object.keys(formData).reduce((acc, field) => {
        acc[field] = true
        return acc
      }, {})
      setTouched(allTouched)
      return
    }
    
    setIsLoading(true)
    try {
      const formattedData = {
        ...formData,
        income: Number(formData.income),
        dob: new Date(formData.dob).toISOString()
      }

      const response = await axios.post(
        `https://pl.pr.flashfund.in/form/submit/${userId}`,
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const searchResponse = await axios.post(
        `https://pl.pr.flashfund.in/api/search/one`,
        { userId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (searchResponse.data?.context?.transaction_id) {
        console.log('Transaction ID:', searchResponse.data.context.transaction_id);
        
        setTransactionId(searchResponse.data.context.transaction_id)
        router.push('/offer')
      }
      console.log('Success:', response.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    const stepErrors = validateForm(formData, step)
    
    const currentStepFields = Object.keys(stepErrors)
    const newTouched = { ...touched }
    currentStepFields.forEach(field => {
      newTouched[field] = true
    })
    setTouched(newTouched)
    
    if (Object.keys(stepErrors).length === 0) {
      setStep(prevStep => prevStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setStep(prevStep => prevStep - 1)
    window.scrollTo(0, 0)
  }

  const getProgressPercentage = () => {
    return (step / 3) * 100;
  }

  const getStepTitle = () => {
    switch(step) {
      case 1: return "Personal Information";
      case 2: return "Employment Details";
      case 3: return "Address Information";
      default: return "";
    }
  }

  const getStepIcon = () => {
    switch(step) {
      case 1: return <User className="w-6 h-6 text-white" />;
      case 2: return <Briefcase className="w-6 h-6 text-white" />;
      case 3: return <Home className="w-6 h-6 text-white" />;
      default: return null;
    }
  }

  // Error display component
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div className="text-red-500 text-xs flex items-center mt-1">
        <AlertCircle size={12} className="mr-1" />
        {error}
      </div>
    );
  };

  const InputField = ({ label, icon, id, name, type = "text", value, onChange, onBlur, error, touched, placeholder, ...props }) => {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-sm font-medium flex items-center text-gray-700">
          {icon && <span className="mr-2 text-indigo-500">{icon}</span>}
          {label} {props.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`rounded-xl border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${touched && error ? 'border-red-300 bg-red-50' : ''}`}
            {...props}
          />
        </div>
        {touched && <ErrorMessage error={error} />}
      </div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name"
                icon={<User size={16} />}
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur('firstName')}
                error={errors.firstName}
                touched={touched.firstName}
                placeholder="John"
                required
              />
              
              <InputField
                label="Last Name"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur('lastName')}
                error={errors.lastName}
                touched={touched.lastName}
                placeholder="Doe"
                required
              />
            </div>

            <InputField
              label="Date of Birth"
              icon={<Calendar size={16} />}
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              onBlur={() => handleBlur('dob')}
              error={errors.dob}
              touched={touched.dob}
              required
            />

            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-sm font-medium flex items-center text-gray-700">
                <User size={16} className="mr-2 text-indigo-500" />
                Gender <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                name="gender" 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, gender: value }))
                  setTouched(prev => ({ ...prev, gender: true }))
                }}
              >
                <SelectTrigger 
                  className={`rounded-xl border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${touched.gender && errors.gender ? 'border-red-300 bg-red-50' : ''}`}
                >
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="transgender">Transgender</SelectItem>
                </SelectContent>
              </Select>
              {touched.gender && <ErrorMessage error={errors.gender} />}
            </div>

            <InputField
              label="PAN Number"
              icon={<CreditCard size={16} />}
              id="pan"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              onBlur={() => handleBlur('pan')}
              error={errors.pan}
              touched={touched.pan}
              placeholder="ABCDE1234F"
              className="uppercase"
              required
            />

            <InputField
              label="Email"
              icon={<AtSign size={16} />}
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              placeholder="john.doe@example.com"
              required
            />

            <InputField
              label="Official Email"
              icon={<AtSign size={16} />}
              id="officialEmail"
              name="officialEmail"
              type="email"
              value={formData.officialEmail}
              onChange={handleChange}
              onBlur={() => handleBlur('officialEmail')}
              error={errors.officialEmail}
              touched={touched.officialEmail}
              placeholder="john.doe@company.com"
              required
            />

            <InputField
              label="Contact Number"
              icon={<Phone size={16} />}
              id="contactNumber"
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={handleChange}
              onBlur={() => handleBlur('contactNumber')}
              error={errors.contactNumber}
              touched={touched.contactNumber}
              placeholder="9123456789"
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="employmentType" className="text-sm font-medium flex items-center text-gray-700">
                <Briefcase size={16} className="mr-2 text-indigo-500" />
                Employment Type <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                name="employmentType"
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, employmentType: value }))
                  setTouched(prev => ({ ...prev, employmentType: true }))
                }}
              >
                <SelectTrigger 
                  className={`rounded-xl border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${touched.employmentType && errors.employmentType ? 'border-red-300 bg-red-50' : ''}`}
                >
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="selfEmployed">Self Employed</SelectItem>
                </SelectContent>
              </Select>
              {touched.employmentType && <ErrorMessage error={errors.employmentType} />}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endUse" className="text-sm font-medium flex items-center text-gray-700">
                <FileText size={16} className="mr-2 text-indigo-500" />
                End Use <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                name="endUse"
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, endUse: value }))
                  setTouched(prev => ({ ...prev, endUse: true }))
                }}
              >
                <SelectTrigger 
                  className={`rounded-xl border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${touched.endUse && errors.endUse ? 'border-red-300 bg-red-50' : ''}`}
                >
                  <SelectValue placeholder="Select Purpose" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                  <SelectItem value="consumerDurablePurchase">Consumer Durable Purchase</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {touched.endUse && <ErrorMessage error={errors.endUse} />}
            </div>

            <InputField
              label="Monthly Income"
              icon={<FileText size={16} />}
              id="income"
              name="income"
              type="number"
              value={formData.income}
              onChange={handleChange}
              onBlur={() => handleBlur('income')}
              error={errors.income}
              touched={touched.income}
              placeholder="30000"
              required
            />

            <InputField
              label="Company Name"
              icon={<Building size={16} />}
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              onBlur={() => handleBlur('companyName')}
              error={errors.companyName}
              touched={touched.companyName}
              placeholder="ABC Corporation"
              required
            />

            <InputField
              label="Udyam Number"
              icon={<FileText size={16} />}
              id="udyamNumber"
              name="udyamNumber"
              value={formData.udyamNumber}
              onChange={handleChange}
              placeholder="UDYAM-XX-XX-XXXXXXX"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <InputField
              label="Address Line 1"
              icon={<Home size={16} />}
              id="addressL1"
              name="addressL1"
              value={formData.addressL1}
              onChange={handleChange}
              onBlur={() => handleBlur('addressL1')}
              error={errors.addressL1}
              touched={touched.addressL1}
              placeholder="123 Main Street"
              required
            />

            <InputField
              label="Address Line 2"
              icon={<Home size={16} />}
              id="addressL2"
              name="addressL2"
              value={formData.addressL2}
              onChange={handleChange}
              placeholder="Apartment 4B"
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="City"
                icon={<MapPin size={16} />}
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={() => handleBlur('city')}
                error={errors.city}
                touched={touched.city}
                placeholder="Mumbai"
                required
              />

              <InputField
                label="State"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={() => handleBlur('state')}
                error={errors.state}
                touched={touched.state}
                placeholder="Maharashtra"
                required
              />
            </div>

            <InputField
              label="Pincode"
              icon={<MapPin size={16} />}
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              onBlur={() => handleBlur('pincode')}
              error={errors.pincode}
              touched={touched.pincode}
              placeholder="400001"
              required
            />

            <InputField
              label="AA ID"
              icon={<CreditCard size={16} />}
              id="aa_id"
              name="aa_id"
              value={formData.aa_id}
              onChange={handleChange}
              onBlur={() => handleBlur('aa_id')}
              error={errors.aa_id}
              touched={touched.aa_id}
              placeholder="Your Account Aggregator ID"
              required
            />

            <div className="flex items-start space-x-3 pt-2">
              <div className="mt-1">
                <Checkbox
                  id="bureauConsent"
                  name="bureauConsent"
                  checked={formData.bureauConsent}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, bureauConsent: checked }))
                    setTouched(prev => ({ ...prev, bureauConsent: true }))
                  }}
                  required
                  className={`rounded text-indigo-600 focus:ring-indigo-500 ${touched.bureauConsent && errors.bureauConsent ? 'border-red-500' : ''}`}
                />
              </div>
              <div>
                <Label htmlFor="bureauConsent" className="text-sm text-gray-700 font-medium">
                  I agree to bureau consent check <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-1">By checking this box, you authorize us to perform a credit check with credit bureaus.</p>
                {touched.bureauConsent && <ErrorMessage error={errors.bureauConsent} />}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-8 pt-6">
          <div className="relative">
            <Image
              src="/FlashfundLogo.png"
              alt="Brand Logo"
              width={180}
              height={40}
              priority
              className="animate-pulse"
            />
            <div className="absolute -bottom-4 left-0 right-0 text-center">
              <p className="text-xs text-indigo-600 font-medium">Quick & Easy Loan Application</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-indigo-600' : 'bg-gray-300'
              }`}>
                {step > 1 ? <Check size={16} className="text-white" /> : <User size={16} className="text-white" />}
              </div>
              <span className={`ml-2 text-xs ${step >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>Personal</span>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'
              }`}>
                {step > 2 ? <Check size={16} className="text-white" /> : <Briefcase size={16} className="text-white" />}
              </div>
              <span className={`ml-2 text-xs ${step >= 2 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>Employment</span>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'
              }`}>
                {step > 3 ? <Check size={16} className="text-white" /> : <Home size={16} className="text-white" />}
              </div>
              <span className={`ml-2 text-xs ${step >= 3 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>Address</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-indigo-500 p-4 flex flex-row items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                {getStepIcon()}
              </div>
              <CardTitle className="text-white text-lg">{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderStep()}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button 
                type="button" 
                onClick={prevStep}
                variant="outline"
                className="flex items-center rounded-xl border-2 border-indigo-100 hover:bg-indigo-50 text-indigo-600"
              >
                <ChevronLeft className="mr-1" size={16} />
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center ml-auto rounded-xl shadow-lg shadow-indigo-200"
              >
                Next
                <ChevronRight className="ml-1" size={16} />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white ml-auto rounded-xl shadow-lg shadow-green-200 w-full py-6 font-medium text-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2025 FlashFund. All rights reserved.</p>
          <p className="mt-1">Your information is secure and encrypted.</p>
        </div>
      </div>
    </div>
  )
}