import Link from "next/link";

const ButtonLogin = (props) => {
    const baseClasses = "btn btn-primary hover:bg-blue-600 hover:border-2 hover:border-white transition-all duration-300";
    const fullWidthClass = props.fullWidth ? "w-full" : "";
    const className = `${baseClasses} ${fullWidthClass}`;

    if(props.isLoggedIn) {
        return (
            <Link href="/dashboard" className={className}>
                Go to Dashboard
            </Link>
        );
    } else {
        return (
            <Link href="/login" className={className}>
                Login
            </Link>
        );
    }
};

export default ButtonLogin;