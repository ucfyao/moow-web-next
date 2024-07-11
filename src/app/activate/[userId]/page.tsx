// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import axios from 'axios';
// import '../styles/activate.css'

// const Activate: React.FC = () => {
//   const [timerCounter, setTimerCounter] = useState(0);
//   const [buttonDisabled, setButtonDisabled] = useState(false);
//   const router = useRouter();
//   const { userId } = router.query; //dynamic params

//   const sendActivateEmail = async () => {
//     setTimerCounter(60); // Reset the timer to 60 seconds
//     setButtonDisabled(true); // Disable the button
//     try {
//       await axios.post('/todo', { userId });
//       alert('prompt.email_has_sent');
//     } catch (e) {
//       alert(e.message || 'prompt.error_occurs');
//     }
//   };

//   useEffect(() => {
//     if (timerCounter > 0) {
//       const timer = setTimeout(() => {
//         setTimerCounter(timerCounter - 1);
//       }, 1000);

//       return () => clearTimeout(timer);
//     } else {
//       setButtonDisabled(false);
//     }
//   }, [timerCounter]);

//   const buttonText = timerCounter > 0
//     ? `Wait ${timerCounter} seconds to resend`
//     : 'Resend activation email';

//   return (
//     <section className="section">
//       <div className="container">
//         <div className="box">
//           <div className="header">
//             <p className="is-size-6 is-pulled-left">{'caption.account_not_active'}</p>
//           </div>
//           <div className="has-text-centered content">
//             <p>{'prompt.account_not_active'}</p>
//             <p>.</p>
//             <button
//               className="button is-link"
//               onClick={sendActivateEmail}
//               disabled={buttonDisabled}
//             >
//               {buttonText}
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Activate;
