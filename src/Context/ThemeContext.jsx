import React, { Children, createContext, useEffect, useState } from 'react'

export const ThemeContextProvider = createContext();

const ThemeContext = (props) => {
 

  const [Theme, setTheme] = useState(localStorage.getItem("Theme"))

   useEffect(() => {
    document.body.classList.add("theme")
    document.body.setAttribute("theme", Theme)
  }, [Theme])

  return (
    <ThemeContextProvider.Provider value={[Theme, setTheme]} >

      {props.children}
    </ThemeContextProvider.Provider>
  )


}

export default ThemeContext
