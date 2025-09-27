require('dotenv').config()
const { ethers } = require('hardhat')

async function main () {
  console.log('Deploying HumanVerificationRegistry...')

  // Get the contract factory
  const HumanVerificationRegistry = await ethers.getContractFactory(
    'HumanVerificationRegistry'
  )

  const identityVerificationHubV2Address = process.env.HUB_V2_ADDRESS
  const scope = process.env.SCOPE
  const verificationConfigId = process.env.VERIFICATION_CONFIG_ID
  const admin = await ethers.getSigners().then(signers => signers[0].address) // Use first signer as admin

  console.log('Deployment parameters:')
  console.log(
    `- Identity Verification Hub V2: ${identityVerificationHubV2Address}`
  )
  console.log(`- Scope: ${scope}`)
  console.log(`- Verification Config ID: ${verificationConfigId}`)
  console.log(`- Admin: ${admin}`)

  // Deploy the contract
  const humanVerificationRegistry = await HumanVerificationRegistry.deploy(
    identityVerificationHubV2Address,
    scope,
    verificationConfigId,
    admin
  )

  await humanVerificationRegistry.waitForDeployment()

  const contractAddress = await humanVerificationRegistry.getAddress()
  console.log(`\nHumanVerificationRegistry deployed to: ${contractAddress}`)
  console.log(`Network: ${hre.network.name}`)

  // Verify deployment
  console.log('\nVerifying deployment...')

  // Check initial state
  const totalHumans = await humanVerificationRegistry.getTotalHumans()
  const deployedConfigId = await humanVerificationRegistry.getConfigId(
    ethers.ZeroHash,
    ethers.ZeroHash,
    '0x'
  )
  const owner = await humanVerificationRegistry.owner()

  console.log(`Total verified humans: ${totalHumans}`)
  console.log(`Verification Config ID: ${deployedConfigId}`)
  console.log(`Contract owner: ${owner}`)

  // Verify admin is set correctly
  if (owner.toLowerCase() === admin.toLowerCase()) {
    console.log('✅ Admin set correctly')
  } else {
    console.log('❌ Admin not set correctly')
  }

  console.log('\nDeployment completed successfully! 🎉')

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: hre.network.name,
    identityVerificationHubV2Address,
    scope,
    verificationConfigId,
    admin,
    deploymentTime: new Date().toISOString()
  }

  console.log('\nDeployment Info:')
  console.log(JSON.stringify(deploymentInfo, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
