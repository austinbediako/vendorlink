import { useEffect, useId, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProfileSetupIllustration } from './VisualAssets';

export function ProfileRequiredPrompt() {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    headingRef.current.focus({ preventScroll: true });
    return () => {
      dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="profile-prompt"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        navigate('/');
      }}
    >
      <div className="profile-prompt-content">
        <div className="profile-prompt-intro">
          <p className="profile-prompt-kicker">Before you get started</p>
          <ProfileSetupIllustration className="profile-prompt-illustration" />
        </div>
        <h2 ref={headingRef} id={titleId} tabIndex={-1} className="profile-prompt-title">
          Your next job starts with your profile.
        </h2>
        <p id={descriptionId} className="profile-prompt-description">
          Complete your artisan profile to access this page. Add your service categories and
          location so businesses can get to know your work.
        </p>
        <div className="profile-prompt-actions">
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              navigate('/complete-profile');
            }}
            className="profile-prompt-primary"
          >
            Complete my profile <ArrowRight size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              navigate('/');
            }}
            className="profile-prompt-secondary"
          >
            Back to home for now
          </button>
        </div>
      </div>
    </dialog>
  );
}
