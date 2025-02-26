"use client"

import { useState } from "react"
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
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

export default function UserDetailsForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const userId = useAuthStore((state) => state.userId)
  const token = useAuthStore((state) => state.token)
  const setTransactionId = useAuthStore((state) => state.setTransactionId)

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
    setStep(prevStep => prevStep + 1)
    window.scrollTo(0, 0)
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

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-center">{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dob" className="text-sm font-medium">Date of Birth</Label>
                <Input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                <Select 
                  name="gender" 
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="transgender">Transgender</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pan" className="text-sm font-medium">PAN Number</Label>
                <Input
                  id="pan"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  className="uppercase mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="officialEmail" className="text-sm font-medium">Official Email</Label>
                <Input
                  type="email"
                  id="officialEmail"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactNumber" className="text-sm font-medium">Contact Number</Label>
                <Input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-center">{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <Label htmlFor="employmentType" className="text-sm font-medium">Employment Type</Label>
                <Select 
                  name="employmentType"
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, employmentType: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="selfEmployed">Self Employed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="endUse" className="text-sm font-medium">End Use</Label>
                <Select 
                  name="endUse"
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, endUse: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
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
              </div>

              <div>
                <Label htmlFor="income" className="text-sm font-medium">Monthly Income</Label>
                <Input
                  type="number"
                  id="income"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="udyamNumber" className="text-sm font-medium">Udyam Number</Label>
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
            <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-center">{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <Label htmlFor="addressL1" className="text-sm font-medium">Address Line 1</Label>
                <Input
                  id="addressL1"
                  name="addressL1"
                  value={formData.addressL1}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
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
                  <Label htmlFor="city" className="text-sm font-medium">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="text-sm font-medium">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pincode" className="text-sm font-medium">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="aa_id" className="text-sm font-medium">AA ID</Label>
                <Input
                  id="aa_id"
                  name="aa_id"
                  value={formData.aa_id}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="bureauConsent"
                  name="bureauConsent"
                  checked={formData.bureauConsent}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, bureauConsent: checked }))
                  }
                  required
                />
                <Label htmlFor="bureauConsent" className="text-sm">
                  I agree to bureau consent check
                </Label>
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