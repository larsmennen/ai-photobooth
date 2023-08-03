import {useEffect, useState} from 'react'

type EnhancedPromptModalProps = {
  images: string[];
  showModal: boolean;
  onSelect: (dataURL: string) => void;
}

function ImagePickerModal(props: EnhancedPromptModalProps) {

  const { showModal, images, onSelect } = props;

  const [show, setShow] = useState<boolean>(showModal);

  useEffect(() => {
    setShow(showModal);
  }, [showModal]);

  const handleSelect = (idx: number) => {
    onSelect(`data:image/png;base64,${images[idx]}`);
    setShow(false);
  };

  return (
    <div
      id="image-picker-modal"
      className={`modal modal-open fixed inset-0 flex items-center justify-center z-50 ${
        show ? 'block' : 'hidden'
      }`}
    >
      <div className="modal-box text-center max-w-6xl mx-auto my-auto overflow-auto">
        <article className="prose">
          <h3 className="font-bold text-lg">Pick your favourite ✨</h3>
          <p>Click on the image you like best! 🎨</p>
          <div className="grid grid-cols-2 gap-4">
            {images && images.map((img, idx) => (
              <div key={idx} className="p-4">
                <img
                  src={`data:image/png;base64,${img}`}
                  alt={idx.toString()}
                  className="cursor-pointer max-w-full h-auto"
                  onClick={() => handleSelect(idx)}
                />
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}

export default ImagePickerModal
