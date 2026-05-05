import React, { useState } from 'react';
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import axios from 'axios';
import DeleteConfirmModal from '../DeleteConfirmModal/DeleteConfirmModal';
import PropertyDetailsModal from '../PropertyDetailsModal/PropertyDetailsModal';
import EditPropertyModal from '../EditPropertyModal/EditPropertyModal';

const PropertyActions = ({ propertyId, propertyTitle, propertyData, onActionSuccess }: any) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // دالة الحذف المركزية
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onActionSuccess();
      setIsDeleteOpen(false);
    } catch (error) {
      alert("فشل في حذف العقار");
    }
  };

  return (
    <>
      <div className="flex justify-start gap-2">
        <button onClick={() => setIsViewOpen(true)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-xl transition-all" title="عرض"><MdVisibility size={20} /></button>
        <button onClick={() => setIsEditOpen(true)} className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-xl transition-all" title="تعديل"><MdEdit size={20} /></button>
        <button onClick={() => setIsDeleteOpen(true)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all" title="حذف"><MdDelete size={20} /></button>
      </div>

      {/* 1. نافذة العرض التفصيلية */}
      <PropertyDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        property={propertyData}
        onEditClick={() => { setIsViewOpen(false); setIsEditOpen(true); }} // الربط السلس للتعديل
      />

      {/* 2. نافذة التعديل */}
    
      <EditPropertyModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        property={propertyData}
        onSuccess={() => {
          onActionSuccess(); // هذه الدالة يجب أن تعيد جلب البيانات (fetch) في الجدول الرئيسي
        }}
      />

      {/* 3. نافذة تأكيد الحذف */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={propertyTitle}
      />
    </>
  );
};

export default PropertyActions;