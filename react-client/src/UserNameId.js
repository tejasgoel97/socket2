import React, {useState, useRef} from 'react'

function UserNameId() {
    const nameRef = useRef();
    const ageRef = useRef();
    return (
        <div className="container">
            <div>
                <input ref={nameRef}></input>                
            </div>
        </div>
    )
}

export default UserNameId
