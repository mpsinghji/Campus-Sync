import styled from "styled-components";

export const ErrorPageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh; /* Full viewport height */
    background-color: #f8d7da; /* Light red background */
    color: #721c24; /* Dark red text */
    text-align: center;

    h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }

    p {
        font-size: 1.2rem;
        margin-bottom: 1rem;
    }

    button {
        padding: 10px 20px;
        font-size: 1rem;
        color: #fff;
        background-color: #dc3545; /* Bootstrap danger color */
        border: none;
        border-radius: 5px;
        cursor: pointer;

        &:hover {
            background-color: #c82333; /* Darker shade on hover */
        }
    }
`;
