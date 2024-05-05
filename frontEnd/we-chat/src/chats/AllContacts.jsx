// /* eslint-disable react/prop-types */
// import React from "react";

// function AllContacts({ contacts }) {
//   function handleFilter(contact) {
//     console.log("at least it works", contact);
//   }

//   return (
//     <div className="flex flex-col space-y-9 ml-[10rem]">
//       {contacts &&
//         contacts.map((contact) => {
//           return (
//             <div
//               className="flex bg-blue-600 space-x-2 w-[10rem] h-[3rem] justify-center"
//               key={contact.conversationID}
//               onClick={handleFilter(contact.conversationID)}
//             >
//               <div className="w-[30%] h-[100%] border-[1px]  "></div>
//               <div className="w-[70%] h-[100%] text-justify flex items-center">
//                 {contact.name}
//               </div>
//             </div>
//           );
//         })}
//     </div>
//   );
// }

// export default AllContacts;
