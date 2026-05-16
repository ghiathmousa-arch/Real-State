// استيراد مكتبة React والـ Hooks الخاصة بإدارة الحالة (useState)
import React, { useState } from 'react';
// استيراد أيقونات التعديل، الحذف، والمعاينة من مكتبة react-icons لتنسيق الأزرار
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";
// استيراد مكتبة Axios لإرسال طلبات الـ HTTP إلى خادم الخلفية (Backend)
import axios from 'axios';
// استيراد نافذة تأكيد الحذف المنبثقة لمنع الحذف العشوائي بالخطأ
import DeleteConfirmModal from '../DeleteConfirmModal/DeleteConfirmModal';
// استيراد نافذة عرض تفاصيل العقار المنبثقة للمعاينة الكاملة
import PropertyDetailsModal from '../PropertyDetailsModal/PropertyDetailsModal';
// استيراد نافذة تعديل بيانات العقار المنبثقة التي قمنا بضبطها سابقاً
import EditPropertyModal from '../EditPropertyModal/EditPropertyModal';

// جلب رابط الـ API الأساسي من متغيرات البيئة لضمان التوافق بين بيئة التطوير والإنتاج
const API_URL = import.meta.env.VITE_API_URL || "";
// تنظيف الرابط للتخلص من كلمة /api والحصول على النطاق الجذري الصافي للسيرفر بشكل آمن
const BASE_URL = API_URL.replace(/\/api\/?$/, "");

// تعريف المكون المساعد المسؤول عن إدارة عمليات العقار (العرض، التعديل، الحذف) في الجدول
const PropertyActions = ({ propertyId, propertyTitle, propertyData, onActionSuccess }: any) => {
  // حالة (State) للتحكم في فتح وإغلاق نافذة تأكيد الحذف المنبثقة
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // حالة (State) للتحكم في فتح وإغلاق نافذة عرض تفاصيل العقار
  const [isViewOpen, setIsViewOpen] = useState(false);
  // حالة (State) للتحكم في فتح وإغلاق نافذة تعديل العقار
  const [isEditOpen, setIsEditOpen] = useState(false);

  // دالة الحذف المركزية المحدثة لتعمل ديناميكياً على السيرفر المحلي والمرفوع (Railway)
  const handleDelete = async () => {
    try {
      // جلب توكن التحقق (JWT) المخزن في المتصفح لتوثيق صلاحية الأدمن في الحذف
      const token = localStorage.getItem("token");
      // إرسال طلب حذف آمن (DELETE) إلى السيرفر باستخدام الرابط الموحد مع تمرير الـ ID للعقار المستهدف
      await axios.delete(`${BASE_URL}/api/properties/${propertyId}`, {
        // تمرير توكن الحماية داخل هيدر الطلب لاعتماد العملية من الـ Backend
        headers: { Authorization: `Bearer ${token}` }
      });
      // استدعاء دالة التحديث لإعادة جلب (Fetch) البيانات الجديدة وتحديث السجلات في الجدول الرئيسي
      onActionSuccess();
      // إغلاق نافذة تأكيد الحذف تلقائياً بعد إتمام عملية الحذف بنجاح من السيرفر
      setIsDeleteOpen(false);
    } catch (error) {
      // إظهار تنبيه منبثق للمستخدم في حال حدوث خطأ أو فشل الاتصال بالسيرفر أثناء الحذف
      alert("فشل في حذف العقار");
    }
  };

  return (
    <>
      {/* حاوية مرنة (Flexbox) لترتيب أزرار العمليات الثلاثة بشكل أفقي متناسق ومتباعد */}
      <div className="flex justify-start gap-2">
        {/* زر فتح نافذة عرض التفاصيل الكاملة للعقار مع تأثيرات تغيير اللون عند حرك الماوس */}
        <button onClick={() => setIsViewOpen(true)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-xl transition-all" title="عرض"><MdVisibility size={20} /></button>
        {/* زر فتح نافذة التعديل المباشر للبيانات */}
        <button onClick={() => setIsEditOpen(true)} className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-xl transition-all" title="تعديل"><MdEdit size={20} /></button>
        {/* زر فتح نافذة تأكيد الحذف لطلب موافقة الأدمن النهائية */}
        <button onClick={() => setIsDeleteOpen(true)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all" title="حذف"><MdDelete size={20} /></button>
      </div>

      {/* 1. نافذة العرض التفصيلية للعقار */}
      <PropertyDetailsModal
        isOpen={isViewOpen} // تمرير حالة الفتح والإغلاق الحالية
        onClose={() => setIsViewOpen(false)} // دالة لتغيير الحالة وإغلاق النافذة
        property={propertyData} // تمرير بيانات العقار الحالية لعرضها للمستخدم
        onEditClick={() => { setIsViewOpen(false); setIsEditOpen(true); }} // ربط سلس: إغلاق مودال التفاصيل وفتح مودال التعديل مباشرة دون تشتيت المستخدم
      />

      {/* 2. نافذة تعديل بيانات العقار */}
      <EditPropertyModal
        isOpen={isEditOpen} // تمرير حالة الفتح والإغلاق الخاصة بالتعديل
        onClose={() => setIsEditOpen(false)} // دالة إغلاق نافذة التعديل عند التراجع
        property={propertyData} // تمرير بيانات العقار الحالية لملء حقول الإدخال تلقائياً
        onSuccess={() => {
          onActionSuccess(); // إعادة تحديث الجدول الرئيسي فور حفظ التعديلات بنجاح لإظهار البيانات الجديدة
        }}
      />

      {/* 3. نافذة تأكيد الحذف النهائي قبل التنفيذ */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen} // تمرير حالة فتح وإغلاق نافذة التأكيد
        onClose={() => setIsDeleteOpen(false)} // دالة إغلاق النافذة في حال ضغط المستخدم على إلغاء التراجع
        onConfirm={handleDelete} // ربط دالة الحذف الفعلية والنهائية بالسيرفر عند ضغط تأكيد الحذف
        title={propertyTitle} // تمرير عنوان العقار لإظهاره داخل رسالة التأكيد لضمان الشفافية
      />
    </>
  );
};

// تصدير المكون بشكل افتراضي ليتمكن المطور من استدعائه واستخدامه داخل جدول إدارة العقارات
export default PropertyActions;