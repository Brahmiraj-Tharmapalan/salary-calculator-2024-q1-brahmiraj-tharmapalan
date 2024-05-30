"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { SlReload } from "react-icons/sl";
import { IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { getBasicSalary } from "@/redux/basicSalary/BasicSalary";
import { RootState } from "@/redux/store";
import { getEarnings } from "@/redux/earnings/Earnings";
import { getDeductions } from "@/redux/deductions/Deductions";
import calculateTax from "@/lib/calculateTax";

interface Earnings {
  id: number;
  value: string;
  epfEtf: boolean;
  amount: number;
}
interface Deductions {
  id: number;
  value: string;
  amount: number;
}

const Page = () => {
  const dispatch = useDispatch();

  /*=============== Get data ===============*/
  const StoredBasicSalary = useSelector(
    (state: RootState) => state.basicSalary.basicSalary
  );
  const StoredEarning = useSelector(
    (state: RootState) => state.earnings.earnings
  );
  const StoredDeductions = useSelector(
    (state: RootState) => state.deductions.deductions
  );

  interface BasicSalary {
    basicSalary: number;
  }
  
  const [basicSalary, setBasicSalary] = useState<number>(0);
  
  useEffect(() => {
    setBasicSalary(StoredBasicSalary);
  }, [StoredBasicSalary]);
  
  const handleBasicSalaryChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    dispatch(getBasicSalary(value));
  };

  /*=============== Earnings ===============*/
  const [earnings, setEarnings] = useState<Earnings[]>([]);

  useEffect(() => {
    if (StoredEarning.length > 0) {
      setEarnings(StoredEarning);
    } else {
      setEarnings([{ id: 1, value: "", epfEtf: false, amount: 0 }]);
    }
  }, []);

  const addEarning = () => {
    setEarnings([
      ...earnings,
      { id: earnings.length + 1, value: "", epfEtf: false, amount: 0 },
    ]);
  };

  const removeEarning = (id: number) => {
    setEarnings(earnings.filter((earning) => earning.id !== id));
  };

  const handleEarningChange = (id: number, key: string, value: any) => {
    setEarnings((prevEarnings) =>
      prevEarnings.map((earning) =>
        earning.id === id ? { ...earning, [key]: value } : earning
      )
    );
  };

  const [sumOfEarnings, setSumOfEarnings] = useState<number>(0);
  useEffect(() => {
    const total = earnings.reduce((acc, curr) => acc + curr.amount, 0);
    setSumOfEarnings(total);
    dispatch(getEarnings(earnings));
  }, [earnings]);

  const totalEarningsForEPF = earnings
  .filter((earning) => earning.epfEtf)
  .reduce((acc, curr) => acc + curr.amount, 0);

  /*=============== Deductions ===============*/
  const [deductions, setDeductions] = useState<Deductions[]>([]);

  useEffect(() => {
    if (StoredDeductions.length > 0) {
      setDeductions(StoredDeductions);
    } else {
      setDeductions([{ id: 1, value: "", amount: 0 }]);
    }
  }, []);

  const addDeduction = () => {
    setDeductions([
      ...deductions,
      { id: deductions.length + 1, value: "", amount: 0 },
    ]);
  };

  const removeDeduction = (id: number) => {
    setDeductions(deductions.filter((deduction) => deduction.id !== id));
  };

  const handleDeductionChange = (id: number, key: string, value: any) => {
    setDeductions((prevDeductions) =>
      prevDeductions.map((deduction) =>
        deduction.id === id ? { ...deduction, [key]: value } : deduction
      )
    );
  };

  const [totalDeductions, setTotalDeductions] = useState<number>(0);
  useEffect(() => {
    const total = deductions.reduce((acc, curr) => acc + curr.amount, 0);
    setTotalDeductions(total);
    dispatch(getDeductions(deductions));
  }, [deductions]);

  /*=============== calculation ===============*/
  //Gross Earnings
  const grossEarnings = basicSalary*1 + sumOfEarnings*1;
  const EmployeeEPF = (basicSalary*1 + totalEarningsForEPF*1 ) *0.08;
  const EmployerEPF = (basicSalary*1 + totalEarningsForEPF*1 ) *0.12;
  const EmployerETF = (basicSalary*1 + totalEarningsForEPF*1 ) *0.03;
  const APIT = calculateTax(grossEarnings);
  const NetSalary = grossEarnings*1 - totalDeductions*1 - EmployeeEPF*1 - APIT;
  const CTC = grossEarnings*1 - totalDeductions*1 + EmployerEPF*1 + EmployerETF*1;


  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Calculate Your Salary</h1>
          <Button color="primary" variant="light">
            <SlReload className="w-5 h-5 text-blue-500" />
            <span className="ml-2 text-blue-500">Reset</span>
          </Button>
        </div>
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="basic-salary"
          >
            Basic Salary
          </label>
          <Input
            type="number"
            id="basic-salary"
            placeholder="Basic Salary"
            variant="bordered"
            radius="sm"
            className="w-1/2"
            onChange={handleBasicSalaryChange}
            value={basicSalary?.toString()}
          />
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Earnings</h2>
          <p className="text-sm text-gray-500 mb-4">
            Allowance, Fixed Allowance, Bonus and etc.
          </p>
          {earnings.map((earning) => (
            <div key={earning.id} className="flex mb-2">
              <div className="flex items-center justify-between w-1/2 gap-2">
                <Input
                  id={`Earnings${earning.id}`}
                  variant="bordered"
                  radius="sm"
                  className="w-3/5"
                  placeholder="Pay Details (Title)"
                  value={earning.value}
                  onChange={(e) =>
                    handleEarningChange(earning.id, "value", e.target.value)
                  }
                />
                <Input
                  type="number"
                  id={`EarningsPrice${earning.id}`}
                  placeholder="Amount"
                  variant="bordered"
                  radius="sm"
                  className="w-2/5"
                  value={earning.amount.toString()}
                  onChange={(e) =>
                    handleEarningChange(earning.id, "amount", +e.target.value)
                  }
                />
              </div>
              <div className="flex items-center justify-start gap-5 pl-5 w-1/2">
                <Button
                  isIconOnly
                  color="default"
                  variant="flat"
                  radius="full"
                  size="sm"
                  onClick={() => removeEarning(earning.id)}
                >
                  <IoClose className="w-5 h-5" />
                </Button>
                <Checkbox
                  checked={earning.epfEtf}
                  onChange={(e) =>
                    handleEarningChange(earning.id, "epfEtf", e.target.checked)
                  }
                >
                  EPF/ETF
                </Checkbox>
              </div>
            </div>
          ))}
          <Button
            className="flex items-center"
            variant="light"
            onClick={addEarning}
          >
            <FaPlus className="w-5 h-5 text-blue-500" />
            <span className="ml-2 text-blue-500">Add New Allowance</span>
          </Button>
        </div>
        <div>
          <h2 className="text-lg font-medium mb-2">Deductions</h2>
          <p className="text-sm text-gray-500 mb-4">
            Salary Advances, Loan Deductions and all
          </p>
          {deductions.map((deduction) => (
            <div key={deduction.id} className="flex mb-2">
              <div className="flex items-center justify-between w-1/2 gap-2">
                <Input
                  id={`Deductions${deduction.id}`}
                  variant="bordered"
                  radius="sm"
                  className="w-3/5"
                  placeholder="Pay Details (Title)"
                  value={deduction.value}
                  onChange={(e) =>
                    handleDeductionChange(deduction.id, "value", e.target.value)
                  }
                />
                <Input
                  type="number"
                  id={`DeductionsPrice${deduction.id}`}
                  placeholder="Amount"
                  variant="bordered"
                  radius="sm"
                  className="w-2/5"
                  value={deduction.amount.toString()}
                  onChange={(e) =>
                    handleDeductionChange(
                      deduction.id,
                      "amount",
                      +e.target.value
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-start gap-5 pl-5 w-1/2">
                <Button
                  isIconOnly
                  color="default"
                  variant="flat"
                  radius="full"
                  size="sm"
                  onClick={() => removeDeduction(deduction.id)}
                >
                  <IoClose className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            className="flex items-center"
            variant="light"
            onClick={addDeduction}
          >
            <FaPlus className="w-5 h-5 text-blue-500" />
            <span className="ml-2 text-blue-500">Add New Deduction</span>
          </Button>
        </div>
      </div>
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your salary</h2>
        <div className="space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Items</span>
            <span className="font-medium">Amount</span>
          </div>
          <div className="flex justify-between">
            <span>Basic Salary</span>
            <span>{basicSalary ? `${basicSalary}.00` : "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span>Gross Earning</span>
            <span>{grossEarnings ? `${grossEarnings}.00` : "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span>Gross Deduction</span>
            <span>{totalDeductions ? `- ${totalDeductions}.00` : "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span>Employee EPF (8%)</span>
            <span>{EmployeeEPF ? `- ${EmployeeEPF}.00` : "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span>APIT</span>
            <span>{APIT ? `- ${APIT}.00` : "0.00"}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-semibold">Net Salary (Take Home)</span>
            <span>{NetSalary ? `${NetSalary}.00` : "0.00"}</span>

          </div>
        </div>
        <h3 className="text-lg font-semibold mt-4">
          Contribution from the Employeer
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Employeer EPF (12%)</span>
            <span>{EmployerEPF ? `${EmployerEPF}.00` : "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span>Employeer ETF (3%)</span>
            <span>{EmployerETF ? `${EmployerETF}.00` : "0.00"}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-semibold">CTC (Cost to Company)</span>
            <span>{CTC ? `${CTC}.00` : "0.00"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
