import {
  ERC20Mock,
  MrCryptoNFT,
  Project,
  RacksProjectManager,
} from "../types/contracts";

import { assert, expect } from "chai";
import { network, ethers } from "hardhat";

import { developmentChains } from "../helper-hardhat-config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployDevChain } from "../utils/deployments/deployDevChain";
import { BigNumber } from "ethers";

/**
 * Run only on development chains
 */
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Project Unit Tests", function () {
      let RacksPM: RacksProjectManager,
        mrc: MrCryptoNFT,
        erc20: ERC20Mock,
        projectContract: Project,
        deployer: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress,
        user3: SignerWithAddress;

      const startUp = async () => {
        const accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        [deployer, user1, user2, user3] = accounts;

        const {
          MockErc20,
          MrCryptoNFT,
          TransparentUpgradeableProxy,
          RacksPM: rpm,
        } = await deployDevChain();

        RacksPM = rpm.attach(TransparentUpgradeableProxy.address);
        mrc = MrCryptoNFT;
        erc20 = MockErc20;

        RacksPM = RacksPM.connect(deployer);
        mrc = mrc.connect(deployer);
        erc20 = erc20.connect(deployer);

        await RacksPM.createProject(
          "Project1",
          ethers.utils.parseEther("100"),
          1,
          2
        );
        const projectAddress = (await RacksPM.getProjects())[0];

        projectContract = await ethers.getContractAt("Project", projectAddress);
        await projectContract.approveProject();

        await erc20.connect(user1).mintMore();
        await erc20.connect(user2).mintMore();
        await erc20.connect(user3).mintMore();
      };

      beforeEach(async function () {
        await loadFixture(startUp);
      });

      describe("Register Project Contributor", () => {
        it("Should revert with contributorErr", async () => {
          await expect(
            projectContract.connect(user1).registerProjectContributor()
          ).to.be.revertedWithCustomError(projectContract, "contributorErr");
        });

        it("Should revert with contributorErr because can not remove a contributor that is not in the project", async () => {
          await expect(
            projectContract.removeContributor(user1.address, true)
          ).to.be.revertedWithCustomError(projectContract, "contributorErr");
        });

        it("Should revert with projectContributorAlreadyExistsErr and maxContributorsNumberExceededErr", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          await expect(
            projectContract.connect(user1).registerProjectContributor()
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectContributorAlreadyExistsErr"
          );

          const previosBalance = await erc20.balanceOf(user2.address);

          await mrc.connect(user2).mint(1);
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user2).registerProjectContributor();

          expect(await projectContract.getNumberOfContributors()).to.deep.equal(
            BigNumber.from(2)
          );

          await mrc.connect(user3).mint(1);
          await RacksPM.connect(user3).registerContributor();
          await erc20
            .connect(user3)
            .approve(projectContract.address, ethers.utils.parseEther("100"));

          await expect(
            projectContract.connect(user3).registerProjectContributor()
          ).to.be.revertedWithCustomError(
            projectContract,
            "maxContributorsNumberExceededErr"
          );

          // if remove one contributor you can add an other one
          await projectContract.removeContributor(user2.address, true);

          expect(await projectContract.getNumberOfContributors()).to.deep.equal(
            BigNumber.from(1)
          );

          const postBalance = await erc20.balanceOf(user2.address);
          assert.equal(postBalance.toString(), previosBalance.toString());

          await projectContract.connect(user3).registerProjectContributor();

          expect(await projectContract.getNumberOfContributors()).to.deep.equal(
            BigNumber.from(2)
          );
        });

        it("Should revert if Contributor is banned with projectContributorIsBannedErr", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await RacksPM.setContributorStateToBanList(user1.address, true);
          expect(await RacksPM.isContributorBanned(user1.address)).to.be.true;

          await expect(
            projectContract.connect(user1).registerProjectContributor()
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectContributorIsBannedErr"
          );
        });

        it("Should revert if Contributor has no Reputation Level Enough with projectContributorHasNoReputationEnoughErr", async () => {
          await RacksPM.createProject(
            "Project2",
            ethers.utils.parseEther("100"),
            2,
            3
          );
          const projects = await RacksPM.getProjects();
          const projectAddress2 = projects[0];

          const Project2 = await ethers.getContractFactory("Project");
          let project2Contract = Project2.attach(projectAddress2);
          await project2Contract.approveProject();

          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));

          await expect(
            project2Contract.connect(user1).registerProjectContributor()
          ).to.be.revertedWithCustomError(
            project2Contract,
            "projectContributorHasNoReputationEnoughErr"
          );
        });

        it("Should register a new Project Contributor", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          expect(
            await erc20.allowance(user1.address, projectContract.address)
          ).to.be.equal(await projectContract.getColateralCost());
          await projectContract.connect(user1).registerProjectContributor();
          const projectContributorsAddress =
            await projectContract.getAllContributorsAddress();
          assert(projectContributorsAddress[0] === user1.address);
          expect(await projectContract.getNumberOfContributors()).to.deep.equal(
            BigNumber.from(1)
          );
        });
        it("Should revert if the smart contract is paused", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));

          await RacksPM.setIsPaused(true);

          await expect(
            projectContract.connect(user1).registerProjectContributor()
          ).to.be.revertedWithCustomError(RacksPM, "pausedErr");
        });
        it("Should revert if the project is deleted", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));

          await projectContract.deleteProject();

          await expect(
            projectContract.connect(user1).registerProjectContributor()
          ).to.be.revertedWithCustomError(projectContract, "deletedErr");
        });
      });

      describe("Finish Project", () => {
        it("Should revert with adminErr", async () => {
          await expect(
            projectContract
              .connect(user1)
              .finishProject(500, [user2.address], [20])
          ).to.be.revertedWithCustomError(projectContract, "adminErr");
        });

        it("Should revert with contributorErr", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          await expect(
            projectContract.finishProject(500, [user2.address], [20])
          ).to.be.revertedWithCustomError(projectContract, "contributorErr");
        });

        it("Should revert with projectInvalidParameterErr", async () => {
          await mrc.connect(user2).mint(1);
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user2).registerProjectContributor();

          await expect(
            projectContract.finishProject(500, [user2.address], [])
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );

          await expect(
            projectContract.finishProject(500, [], [20])
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );

          await expect(
            projectContract.finishProject(0, [user2.address], [20])
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );
        });

        it("Should revert because of less contributors array length than project contributors registered with projectInvalidParameterErr", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          await mrc.connect(user2).mint(1);
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user2).registerProjectContributor();

          await expect(
            projectContract.finishProject(
              500,
              [user2.address],
              [ethers.utils.parseEther("100")]
            )
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );
        });

        it("Should revert becase de total of participation weight is greeter than 100 ", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          expect(await erc20.balanceOf(user1.address)).to.be.equal(
            ethers.utils.parseEther("10000")
          );
          await projectContract.connect(user1).registerProjectContributor();
          expect(await erc20.balanceOf(user1.address)).to.be.equal(
            ethers.utils.parseEther("9900")
          );

          (await mrc.connect(user2).mint(1)).wait();
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          expect(await erc20.balanceOf(user2.address)).to.be.equal(
            ethers.utils.parseEther("10000")
          );
          await projectContract.connect(user2).registerProjectContributor();
          expect(await erc20.balanceOf(user2.address)).to.be.equal(
            ethers.utils.parseEther("9900")
          );

          await expect(
            projectContract.finishProject(
              500,
              [user2.address, user1.address],
              [70, 70]
            )
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );
        });

        it("Should revert with projectFinishedErr", async () => {
          await mrc.connect(user2).mint(1);
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user2).registerProjectContributor();
          await projectContract.finishProject(500, [user2.address], [100]);

          await expect(
            projectContract.finishProject(500, [user2.address], [100])
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectFinishedErr"
          );
        });

        it("Should set the Project as finished, refund colateral and grant rewards", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          expect(await erc20.balanceOf(user1.address)).to.be.equal(
            ethers.utils.parseEther("10000")
          );
          await projectContract.connect(user1).registerProjectContributor();
          expect(await erc20.balanceOf(user1.address)).to.be.equal(
            ethers.utils.parseEther("9900")
          );

          (await mrc.connect(user2).mint(1)).wait();
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          expect(await erc20.balanceOf(user2.address)).to.be.equal(
            ethers.utils.parseEther("10000")
          );
          await projectContract.connect(user2).registerProjectContributor();
          expect(await erc20.balanceOf(user2.address)).to.be.equal(
            ethers.utils.parseEther("9900")
          );

          expect(await projectContract.isFinished()).to.be.false;

          await projectContract.finishProject(
            500,
            [user2.address, user1.address],
            [70, 30]
          );

          expect(await projectContract.isFinished()).to.be.true;

          expect(await erc20.balanceOf(user1.address)).to.be.equal(
            ethers.utils.parseEther("10000")
          );
          expect(await erc20.balanceOf(user2.address)).to.be.equal(
            ethers.utils.parseEther("10000")
          );

          expect(
            await projectContract.getContributorParticipation(user1.address)
          ).to.be.equal(30);
          expect(
            await projectContract.getContributorParticipation(user2.address)
          ).to.be.equal(70);

          const pcUser1 = await RacksPM.getContributorData(user1.address);
          const pcUser2 = await RacksPM.getContributorData(user2.address);

          expect(pcUser1.wallet).to.be.equal(user1.address);
          expect(pcUser1.reputationLevel).to.be.equal(2);
          expect(pcUser1.reputationPoints).to.be.equal(50);
          expect(pcUser2.wallet).to.be.equal(user2.address);
          expect(pcUser2.reputationLevel).to.be.equal(3);
          expect(pcUser2.reputationPoints).to.be.equal(50);
        });

        it("Should finish a project, create a new project, finish that project with a banned Contributor and withdraw the banned's lost colateral", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          await mrc.connect(user2).mint(1);
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user2).registerProjectContributor();

          await projectContract.finishProject(
            500,
            [user2.address, user1.address],
            [70, 30]
          );

          await RacksPM.createProject(
            "Project2",
            ethers.utils.parseEther("100"),
            1,
            3
          );
          const projectAddress2 = (await RacksPM.getProjects())[0];

          const Project2 = await ethers.getContractFactory("Project");
          let project2Contract = Project2.attach(projectAddress2);
          await project2Contract.approveProject();

          await mrc.connect(user3).mint(1);
          await RacksPM.connect(user3).registerContributor();
          await erc20
            .connect(user3)
            .approve(project2Contract.address, ethers.utils.parseEther("100"));
          expect(await erc20.balanceOf(user3.address)).to.be.equal(
            ethers.utils.parseEther("10000")
          );
          await project2Contract.connect(user3).registerProjectContributor();
          expect(await erc20.balanceOf(user3.address)).to.be.equal(
            ethers.utils.parseEther("9900")
          );
          await RacksPM.setContributorStateToBanList(user3.address, true);
          expect(await RacksPM.isContributorBanned(user3.address)).to.be.equal(
            true
          );

          await erc20
            .connect(user1)
            .approve(project2Contract.address, ethers.utils.parseEther("100"));
          await project2Contract.connect(user1).registerProjectContributor();

          await erc20
            .connect(user2)
            .approve(project2Contract.address, ethers.utils.parseEther("100"));
          await project2Contract.connect(user2).registerProjectContributor();

          await project2Contract.finishProject(
            500,
            [user2.address, user1.address],
            [65, 35]
          );

          expect(await erc20.balanceOf(user3.address)).to.be.equal(
            ethers.utils.parseEther("9900")
          );
          expect(await erc20.balanceOf(user2.address)).to.be.equal(
            ethers.utils.parseEther("10065")
          );
          expect(await erc20.balanceOf(user1.address)).to.be.equal(
            ethers.utils.parseEther("10035")
          );

          expect(
            await project2Contract.getContributorParticipation(user3.address)
          ).to.be.equal(0);

          const pcUserBanned = await RacksPM.getContributorData(user3.address);
          const pcUser1 = await RacksPM.getContributorData(user1.address);
          const pcUser2 = await RacksPM.getContributorData(user2.address);

          expect(pcUserBanned.wallet).to.be.equal(user3.address);
          expect(pcUserBanned.reputationLevel).to.be.equal(1);
          expect(pcUserBanned.reputationPoints).to.be.equal(0);

          expect(pcUser1.wallet).to.be.equal(user1.address);
          expect(pcUser1.reputationLevel).to.be.equal(3);
          expect(pcUser1.reputationPoints).to.be.equal(25);
          expect(pcUser2.wallet).to.be.equal(user2.address);
          expect(pcUser2.reputationLevel).to.be.equal(4);
          expect(pcUser2.reputationPoints).to.be.equal(75);
        });
        it("Should revert if the smart contract is paused", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          await mrc.connect(user2).mint(1);
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user2).registerProjectContributor();

          await RacksPM.setIsPaused(true);

          await expect(
            projectContract.finishProject(
              500,
              [user2.address, user1.address],
              [70, 30]
            )
          ).to.be.revertedWithCustomError(RacksPM, "pausedErr");

          await RacksPM.setIsPaused(false);

          await expect(
            projectContract.deleteProject()
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectNoEditableErr"
          );
        });
      });

      describe("Edit Project", () => {
        it("Should revert with pausedErr", async () => {
          await await RacksPM.setIsPaused(true);
          await expect(
            projectContract.setColateralCost(ethers.utils.parseEther("100"))
          ).to.be.revertedWithCustomError(RacksPM, "pausedErr");

          await expect(
            projectContract.setName("Project Updated")
          ).to.be.revertedWithCustomError(RacksPM, "pausedErr");

          await expect(
            projectContract.setReputationLevel(3)
          ).to.be.revertedWithCustomError(RacksPM, "pausedErr");
          await expect(
            projectContract.setMaxContributorsNumber(3)
          ).to.be.revertedWithCustomError(RacksPM, "pausedErr");
        });

        it("Should revert with deletedErr", async () => {
          await await projectContract.deleteProject();
          await expect(
            projectContract.setColateralCost(ethers.utils.parseEther("100"))
          ).to.be.revertedWithCustomError(projectContract, "deletedErr");

          await expect(
            projectContract.setName("Project Updated")
          ).to.be.revertedWithCustomError(projectContract, "deletedErr");

          await expect(
            projectContract.setReputationLevel(3)
          ).to.be.revertedWithCustomError(projectContract, "deletedErr");
          await expect(
            projectContract.setMaxContributorsNumber(3)
          ).to.be.revertedWithCustomError(projectContract, "deletedErr");
        });
        it("Should revert with adminErr", async () => {
          // Test not working because of Hardhat bug
          // await expect(
          //     projectContract.connect(user1).setColateralCost(100)
          // ).to.be.revertedWithCustomError(projectContract, "adminErr");
          await expect(
            projectContract.connect(user1).setName("Project Updated")
          ).to.be.revertedWithCustomError(projectContract, "adminErr");
          await expect(
            projectContract.connect(user1).setReputationLevel(3)
          ).to.be.revertedWithCustomError(projectContract, "adminErr");
          await expect(
            projectContract.connect(user1).setMaxContributorsNumber(3)
          ).to.be.revertedWithCustomError(projectContract, "adminErr");
        });

        it("Should revert with projectInvalidParameterErr", async () => {
          await expect(
            projectContract.setName("")
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );
          await expect(
            projectContract.setReputationLevel(0)
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );
          await expect(
            projectContract.setMaxContributorsNumber(0)
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );
        });

        it("Should revert with projectNoEditableErr", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          await expect(
            projectContract.setName("Project Updated")
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectNoEditableErr"
          );
          await expect(
            projectContract.setColateralCost(200)
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectNoEditableErr"
          );
          await expect(
            projectContract.setReputationLevel(3)
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectNoEditableErr"
          );
          await expect(
            projectContract.setMaxContributorsNumber(0)
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectInvalidParameterErr"
          );

          await expect(
            projectContract.deleteProject()
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectNoEditableErr"
          );
        });

        it("Should edit Project with new Colateral Cost, Reputation Level and Max Contributors Number", async () => {
          projectContract.setName("Project Updated");
          projectContract.setReputationLevel(3);
          projectContract.setColateralCost(500);
          projectContract.setMaxContributorsNumber(5);

          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));

          await expect(
            projectContract.connect(user1).registerProjectContributor()
          ).to.be.revertedWithCustomError(
            projectContract,
            "projectContributorHasNoReputationEnoughErr"
          );

          const name = await projectContract.getName();
          expect(name).to.be.equal("Project Updated");
          const reputationLv = await projectContract.getReputationLevel();
          expect(reputationLv.toNumber()).to.be.equal(3);
          const colateralCost = await projectContract.getColateralCost();
          expect(colateralCost.toNumber()).to.be.equal(500);
          const maxContributorsNumber =
            await projectContract.getMaxContributors();
          expect(maxContributorsNumber.toNumber()).to.be.equal(5);
        });
      });

      describe("Give away extra rewards after Project is finished", () => {
        it("Should revert with adminErr", async () => {
          await expect(
            projectContract.connect(user1).giveAway()
          ).to.be.revertedWithCustomError(projectContract, "adminErr");
        });

        it("Should revert with pausedErr", async () => {
          RacksPM.setIsPaused(true);
          await expect(
            projectContract.giveAway()
          ).to.be.revertedWithCustomError(RacksPM, "pausedErr");
        });

        it("Should revert with notCompletedErr", async () => {
          await expect(
            projectContract.giveAway()
          ).to.be.revertedWithCustomError(projectContract, "notCompletedErr");
        });

        it("Should give away successfully", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          (await mrc.connect(user2).mint(1)).wait();
          await RacksPM.connect(user2).registerContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user2).registerProjectContributor();

          await projectContract.finishProject(
            500,
            [user2.address, user1.address],
            [50, 50]
          );
        });
      });
      describe("Fund Project", () => {
        it("Should revert with invalidParameterErr on project with no contributors", async () => {
          await erc20.connect(user2).approve(projectContract.address, 500);
          await expect(
            projectContract.connect(user2).fundProject(500)
          ).to.be.revertedWithCustomError(
            projectContract,
            "invalidParameterErr"
          );

          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          await expect(
            projectContract.connect(user2).fundProject(0)
          ).to.be.revertedWithCustomError(
            projectContract,
            "invalidParameterErr"
          );
        });

        it("Should revert with ERC20: insufficient allowance", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();

          await expect(
            projectContract.connect(user2).fundProject(500)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("Should fund the Project succesfully", async () => {
          await mrc.connect(user1).mint(1);
          await RacksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(projectContract.address, ethers.utils.parseEther("100"));
          await projectContract.connect(user1).registerProjectContributor();
          await erc20
            .connect(user2)
            .approve(projectContract.address, ethers.utils.parseEther("500"));
          const tx = await projectContract
            .connect(user2)
            .fundProject(ethers.utils.parseEther("500"));
          const rc = await tx.wait();
          const event = rc.events?.find(
            (e) => e.event == "projectFunded"
          )?.args;
          await expect(event).to.exist;
          await expect(
            await projectContract.getAccountFunds(user2.address)
          ).to.be.equal(ethers.utils.parseEther("500"));
          await expect(
            await projectContract.getTotalAmountFunded()
          ).to.be.equal(ethers.utils.parseEther("500"));
        });
      });
    });
