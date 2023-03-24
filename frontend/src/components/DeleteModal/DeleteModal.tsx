import { useState } from 'react'

function DeleteModal({ id, isOpen, title, body, onCancel, onConfirm }) {
  const [show, setShow] = useState(isOpen)

  const handleClose = () => {
    setShow(false)
    onCancel()
  }

  const handleConfirm = () => {
    setShow(false)
    onConfirm()
  }

  return (
    <div
      id={`modal-${id}`}
      className={`modal ${
        show ? 'modal-open' : ''
      }`}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{body}</p>
        <div className="modal-action">
          <button
            className="btn btn-secondary mr-2"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
