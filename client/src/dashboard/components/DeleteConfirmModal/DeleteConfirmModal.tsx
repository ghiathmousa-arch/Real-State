
import { MdWarning, MdClose } from "react-icons/md";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* الخلفية المعتمة مع تأثير بلور (Blur) */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* نافذة المودال */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">

        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute left-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MdClose size={24} />
        </button>

        <div className="text-center">
          {/* أيقونة التحذير مع حركة نبض */}
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <MdWarning className="text-red-500 size-10" />
          </div>

          <h3 className="text-xl font-black text-[#0f2d4a] mb-2">تأكيد الحذف</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            هل أنت متأكد من حذف <span className="font-bold text-red-600">"{title}"</span>؟
            هذا الإجراء لا يمكن التراجع عنه وسيتم مسح كافة البيانات المرتبطة بالعقار.
          </p>

          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200 hover:shadow-red-300 active:scale-95"
            >
              نعم، احذف الآن
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-bold transition-all active:scale-95"
            >
              إلغاء الأمر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;