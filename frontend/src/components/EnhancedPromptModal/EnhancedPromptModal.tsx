import {useEffect, useState} from 'react'

type EnhancedPromptModalProps = {
  showModal: boolean;
  prompt: string;
}

function EnhancedPromptModal(props: EnhancedPromptModalProps) {

  const { showModal, prompt } = props;

  const [show, setShow] = useState<boolean>(showModal);

  useEffect(() => {
    setShow(showModal);
  }, [showModal]);

  return (
    <div
      id="enhanced-prompt-modal"
      className={`modal ${
        show ? 'modal-open' : ''
      }`}
    >
      <div className="modal-box text-center">
        <article className="prose">
          <h3 className="font-bold text-lg">Working on it...</h3>
          <p>The AI artists are generating some images for you right now. They'll be done in ~30 seconds. We've given them the following instructions:</p>
          <blockquote className={"prose-xl"}>{prompt}</blockquote>
        </article>
        <progress className="progress w-56 mt-10"></progress>
      </div>
    </div>
  )
}

export default EnhancedPromptModal
