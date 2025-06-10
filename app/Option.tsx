import Link from "next/link"
function OptionComponent(){
    return(
        <>
        <div className="">
            <nav>
                <ul>
                    <li>
                        <Link href="/profile">Profile</Link>
                    </li>
                    <li>
                        <Link href="/logout">Logout</Link>
                    </li>
                    <li>
                        <Link href="/setting">Setting</Link>
                    </li>
                    <li>
                        <Link href="/help">Help</Link>
                    </li>
                </ul>
            </nav>
        </div>
        </>
    )
}