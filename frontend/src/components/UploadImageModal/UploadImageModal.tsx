import {useState} from 'react'
import {useAppDispatch, useAppSelector} from "@/store";
import {updateConfig} from "@/slices/config";
import {addBackground} from "@/slices/images";
import {nanoid} from "@reduxjs/toolkit";

type UploadImageModalProps = {
  isOpen: boolean;
  onDone: () => void;
}

function UploadImageModal(props: UploadImageModalProps) {

  const [show, setShow] = useState(props.isOpen);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [dataURL, setDataURL] = useState('');
  const dispatch = useAppDispatch();

  const handleConfirm = () => {
    const id = `${Date.now()}-${nanoid()}`;
    dispatch(addBackground({
      id,
      data: dataURL,
      prompt: promptInputValue
    }));
    setShow(false);
    props.onDone();
  }

  const handleCancel = () => {
    setPromptInputValue('');
    setShow(false);
    props.onDone();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setDataURL(reader.result as string);
    };
    if (file && file.type === 'image/png') {
      reader.readAsDataURL(file);
    }
  }

  return (
    <div
      id="upload-image-modal"
      className={`modal ${
        show ? 'modal-open' : ''
      }`}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">Upload Image</h3>
        <div className="mt-4 form-control w-full max-w-xs">
          <label htmlFor="Prompt" className="form-label label">
            <span className="label-text">Prompt</span>
          </label>
          <input
            type="text"
            className="form-input input input-bordered w-full max-w-xs"
            placeholder=""
            value={promptInputValue}
            onChange={(event) =>
              setPromptInputValue(event.target.value)
            }
          />
        </div>
        <div className="mt-4 form-control w-full max-w-xs">
          <label htmlFor="Image" className="form-label label">
            <span className="label-text">Image</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
            accept={'image/png'}
            onChange={handleFileChange}
          />
        </div>
        <div className="modal-action">
          <button className="btn btn-error" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadImageModal
