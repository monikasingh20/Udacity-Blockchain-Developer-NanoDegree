pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    struct Airlines {
        bool isRegistered;
        bool isOperational;
    }

    struct Insurance {
        address passenger;
        uint256 amount;

    }
    struct Fund {
        uint256 amount;
    }
    struct Voters {
        bool status;
    }

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
     bool private vote_status = false;

    mapping(address => Airlines) airlines;                             // mapping address to struct which holds registered airlines.
    mapping(address => Insurance) insurance;                             // Airline address maps to struct
    mapping(address => uint256) balances;
    mapping(address => Fund) funds;
    address[] multiCalls = new address[](0);
    mapping(address => uint) private voteCount;
    mapping(address => Voters) voters;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function getInsuredPassenger_amount(address airline) external requireIsOperational  returns(address, uint256){
        return (insurance[airline].passenger,insurance[airline].amount);
    }

    function isAirline
                            (
                                address account
                            )
                            external

                            returns(bool)
    {
        require(account != address(0), "'account' must be a valid address.");

        return airlines[account].isRegistered;
    }


    function getAirlineOperatingStatus(address account) external requireIsOperational returns(bool){
        return airlines[account].isOperational;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (
                                address airline
                            )
                            external
                            requireIsOperational
                            returns(bool success, uint256 votes)
    {
        require(!airlines[airline].isRegistered, "Airline is already registered");
        require(airlines[msg.sender].isOperational, "Caller airline is not operational");

        uint multicall_Length = multiCalls.length;
        if (multicall_Length < 4)
        {
            airlines[airline] = Airlines({
            isRegistered: true,
            isOperational: false
            });
            multiCalls.push(airline);
            return(true,0);
        }
        else
        {
            if(vote_status)
            {
                uint voteCounts = voteCount[airline];
                if(voteCounts >= multicall_Length/2)
                {
                    airlines[airline] = Airlines({
                                                isRegistered: true,
                                                isOperational: false
                                                });
                    multiCalls.push(airline);
                    vote_status = false;
                    delete voteCount[airline];
                    return(true, 0);
                }
                else
                {
                    delete voteCount[airline];
                    return(false, 0);
                }
            }
            else
            {
                return(false,0);
            }
        }
    }

    function approveAirlineRegistration(address airline, bool airline_vote) public requireIsOperational {

        require(!airlines[airline].isRegistered,"airline already registered");
        require(airlines[msg.sender].isOperational,"airline not operational");

        if(airline_vote == true){
            bool isDuplicate = false;
            uint incrementVote = 1;
            isDuplicate = voters[msg.sender].status;
            require(!isDuplicate, "Caller has already voted.");
            voters[msg.sender] = Voters({
                                            status: true
                                        });
            uint vote = voteCount[airline];
            voteCount[airline] = vote.add(incrementVote);
            }
        vote_status = true;
    }

    function getUserCredit(address passenger) external requireIsOperational returns(uint256){
        return balances[passenger];
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (
                                address airline
                            )
                            external
                            payable
                            requireIsOperational
    {
        require(airlines[airline].isOperational,"Airline you are buying insurance from should be operational");
        require((msg.value > 0 ether) && (msg.value <= 1 ether), "You can not buy insurance of more than 1 ether or less than 0 ether");
        insurance[airline] = Insurance({
            passenger: msg.sender,
            amount: msg.value
        });
        uint256 getFund = funds[airline].amount;
        funds[airline].amount = getFund.add(msg.value);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    address airline,
                                    uint256 amount
                                )
                                external
                                requireIsOperational
    {
        uint256 required_amount =insurance[airline].amount.mul(3).div(2);

        require(insurance[airline].passenger == msg.sender, "Passenger is not insured");
        require(required_amount == amount, "The amount to be credited is not as espected");
        balances[msg.sender] = amount;
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            requireIsOperational
    {
        require(balances[msg.sender] > 0, "No balance to withdraw");
        uint256 withdraw_cash = balances[msg.sender];
        delete balances[msg.sender];
        msg.sender.transfer(withdraw_cash);

    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
                            requireIsOperational
    {
        require(msg.value == 10 ether,"Ether should be 10");
        require(!airlines[msg.sender].isOperational, "Airline is already funded");

        funds[msg.sender] = Fund({
            amount: msg.value
        });

        airlines[msg.sender].isOperational = true;
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

