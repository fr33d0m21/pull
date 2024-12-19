import { Camera, X } from 'lucide-react';

interface ItemImageUploadProps {
  images: string[];
  onAddImage: (image: string) => void;
  onRemoveImage: (index: number) => void;
}

export default function ItemImageUpload({
  images,
  onAddImage,
  onRemoveImage
}: ItemImageUploadProps) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Images</label>
      <div className="mt-1 flex items-center space-x-4">
        <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Camera className="w-4 h-4 mr-2" />
          Add Image
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </label>
        <div className="flex space-x-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img src={image} alt="" className="h-12 w-12 object-cover rounded" />
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}