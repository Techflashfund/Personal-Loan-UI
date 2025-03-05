"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import useAuthStore from '@/store/user'
import { useRouter } from 'next/navigation'
import { formService } from '@/services/formservices'
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
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react"

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
  const isOver21 = (dob) => {
    const today = new Date()
    const birthDate = new Date(dob)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age >= 21
  }

  const validateForm = (data, currentStep) => {
    let newErrors = {}
    
    // Validation based on current step
    if (currentStep === 1) {
      if (!data.firstName.trim()) newErrors.firstName = "First name is required"
      if (!data.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!data.dob) {
        newErrors.dob = "Date of birth is required"
      } else if (!isOver21(data.dob)) {
        newErrors.dob = "You must be at least 21 years old"
      }
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
      // udyamNumber is optional, no validation needed
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

  // Validate on touched field change
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
    
    // Final validation before submission
    const formErrors = validateForm(formData, 3)
    setErrors(formErrors)
    
    if (Object.keys(formErrors).length > 0) {
      // Mark all fields as touched to show errors
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

      await formService.submitForm(userId, formattedData, token)
      const searchResponse = await formService.searchOne(userId, token)
       console.log('Search Response:', searchResponse);
       
       if (searchResponse?.context?.transaction_id) {
        console.log('Transaction ID:', searchResponse.context.transaction_id)
        setTransactionId(searchResponse.context.transaction_id)
        router.push('/offer')
      } else {
        throw new Error('Transaction ID not found in response')
      }
      
    } catch (error) {
      console.error('Error:', error.message)
    setErrors(prev => ({
      ...prev,
      submit: error.message
    }))
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    const stepErrors = validateForm(formData, step)
    
    // Mark all fields for current step as touched
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

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center items-center space-x-2 mb-6">
        {[1, 2, 3].map((item) => (
          <div 
            key={item} 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === item 
                ? 'bg-blue-600 text-white' 
                : step > item 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step > item ? <Check size={16} /> : item}
          </div>
        ))}
      </div>
    )
  }

  const getStepTitle = () => {
    switch(step) {
      case 1: return "Personal Information";
      case 2: return "Employment Details";
      case 3: return "Address Information";
      default: return "";
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

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-lg">
              <CardTitle className="text-center">{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('firstName')}
                    required
                    className={`mt-1 ${touched.firstName && errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {touched.firstName && <ErrorMessage error={errors.firstName} />}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('lastName')}
                    required
                    className={`mt-1 ${touched.lastName && errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {touched.lastName && <ErrorMessage error={errors.lastName} />}
                </div>
              </div>

              <div>
                <Label htmlFor="dob" className="text-sm font-medium">Date of Birth *</Label>
                <Input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={() => handleBlur('dob')}
                  required
                  className={`mt-1 ${touched.dob && errors.dob ? 'border-red-500' : ''}`}
                />
                {touched.dob && <ErrorMessage error={errors.dob} />}
              </div>

              <div>
                <Label htmlFor="gender" className="text-sm font-medium">Gender *</Label>
                <Select 
                  name="gender" 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, gender: value }))
                    setTouched(prev => ({ ...prev, gender: true }))
                  }}
                >
                  <SelectTrigger 
                    className={`mt-1 ${touched.gender && errors.gender ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="transgender">Transgender</SelectItem>
                  </SelectContent>
                </Select>
                {touched.gender && <ErrorMessage error={errors.gender} />}
              </div>

              <div>
                <Label htmlFor="pan" className="text-sm font-medium uppercase">PAN Number *</Label>
                <Input
                  id="pan"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  onBlur={() => handleBlur('pan')}
                  className={` mt-1 ${touched.pan && errors.pan ? 'border-red-500' : ''}`}
                  required
                />
                {touched.pan && <ErrorMessage error={errors.pan} />}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  required
                  className={`mt-1 ${touched.email && errors.email ? 'border-red-500' : ''}`}
                />
                {touched.email && <ErrorMessage error={errors.email} />}
              </div>

              <div>
                <Label htmlFor="officialEmail" className="text-sm font-medium">Official Email *</Label>
                <Input
                  type="email"
                  id="officialEmail"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  onBlur={() => handleBlur('officialEmail')}
                  required
                  className={`mt-1 ${touched.officialEmail && errors.officialEmail ? 'border-red-500' : ''}`}
                />
                {touched.officialEmail && <ErrorMessage error={errors.officialEmail} />}
              </div>

              <div>
                <Label htmlFor="contactNumber" className="text-sm font-medium">Contact Number *</Label>
                <Input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlur('contactNumber')}
                  required
                  className={`mt-1 ${touched.contactNumber && errors.contactNumber ? 'border-red-500' : ''}`}
                />
                {touched.contactNumber && <ErrorMessage error={errors.contactNumber} />}
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-lg">
              <CardTitle className="text-center">{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <Label htmlFor="employmentType" className="text-sm font-medium">Employment Type *</Label>
                <Select 
                  name="employmentType"
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, employmentType: value }))
                    setTouched(prev => ({ ...prev, employmentType: true }))
                  }}
                >
                  <SelectTrigger 
                    className={`mt-1 ${touched.employmentType && errors.employmentType ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="selfEmployed">Self Employed</SelectItem>
                  </SelectContent>
                </Select>
                {touched.employmentType && <ErrorMessage error={errors.employmentType} />}
              </div>

              <div>
                <Label htmlFor="endUse" className="text-sm font-medium">End Use *</Label>
                <Select 
                  name="endUse"
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, endUse: value }))
                    setTouched(prev => ({ ...prev, endUse: true }))
                  }}
                >
                  <SelectTrigger 
                    className={`mt-1 ${touched.endUse && errors.endUse ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select Purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumerDurablePurchase">Consumer Durable Purchase</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {touched.endUse && <ErrorMessage error={errors.endUse} />}
              </div>

              <div>
                <Label htmlFor="income" className="text-sm font-medium">Monthly Income *</Label>
                <Input
                  type="number"
                  id="income"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  onBlur={() => handleBlur('income')}
                  required
                  className={`mt-1 ${touched.income && errors.income ? 'border-red-500' : ''}`}
                />
                {touched.income && <ErrorMessage error={errors.income} />}
              </div>

              <div>
                <Label htmlFor="companyName" className="text-sm font-medium">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('companyName')}
                  required
                  className={`mt-1 ${touched.companyName && errors.companyName ? 'border-red-500' : ''}`}
                />
                {touched.companyName && <ErrorMessage error={errors.companyName} />}
              </div>

              <div>
                <Label htmlFor="udyamNumber" className="text-sm font-medium">Udyam Number (Optional)</Label>
                <Input
                  id="udyamNumber"
                  name="udyamNumber"
                  value={formData.udyamNumber}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-lg">
              <CardTitle className="text-center">{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <Label htmlFor="addressL1" className="text-sm font-medium">Address Line 1 *</Label>
                <Input
                  id="addressL1"
                  name="addressL1"
                  value={formData.addressL1}
                  onChange={handleChange}
                  onBlur={() => handleBlur('addressL1')}
                  required
                  className={`mt-1 ${touched.addressL1 && errors.addressL1 ? 'border-red-500' : ''}`}
                />
                {touched.addressL1 && <ErrorMessage error={errors.addressL1} />}
              </div>

              <div>
                <Label htmlFor="addressL2" className="text-sm font-medium">Address Line 2</Label>
                <Input
                  id="addressL2"
                  name="addressL2"
                  value={formData.addressL2}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={() => handleBlur('city')}
                    required
                    className={`mt-1 ${touched.city && errors.city ? 'border-red-500' : ''}`}
                  />
                  {touched.city && <ErrorMessage error={errors.city} />}
                </div>

                <div>
                  <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    onBlur={() => handleBlur('state')}
                    required
                    className={`mt-1 ${touched.state && errors.state ? 'border-red-500' : ''}`}
                  />
                  {touched.state && <ErrorMessage error={errors.state} />}
                </div>
              </div>

              <div>
                <Label htmlFor="pincode" className="text-sm font-medium">Pincode *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  onBlur={() => handleBlur('pincode')}
                  required
                  className={`mt-1 ${touched.pincode && errors.pincode ? 'border-red-500' : ''}`}
                />
                {touched.pincode && <ErrorMessage error={errors.pincode} />}
              </div>

              <div>
                <Label htmlFor="aa_id" className="text-sm font-medium">AA ID *</Label>
                <Input
                  id="aa_id"
                  name="aa_id"
                  value={formData.aa_id}
                  onChange={handleChange}
                  onBlur={() => handleBlur('aa_id')}
                  required
                  className={`mt-1 ${touched.aa_id && errors.aa_id ? 'border-red-500' : ''}`}
                />
                {touched.aa_id && <ErrorMessage error={errors.aa_id} />}
              </div>

              <div className="flex items-start space-x-2 pt-4">
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
                    className={touched.bureauConsent && errors.bureauConsent ? 'border-red-500' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="bureauConsent" className="text-sm">
                    I agree to bureau consent check *
                  </Label>
                  {touched.bureauConsent && <ErrorMessage error={errors.bureauConsent} />}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center mb-4 pt-6">
          <Image
            src="/FlashfundLogo.png"
            alt="Brand Logo"
            width={180}
            height={40}
            priority
            className="animate-pulse"
          />
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button 
                type="button" 
                onClick={prevStep}
                variant="outline"
                className="flex items-center"
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
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center ml-auto"
              >
                Next
                <ChevronRight className="ml-1" size={16} />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white ml-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}